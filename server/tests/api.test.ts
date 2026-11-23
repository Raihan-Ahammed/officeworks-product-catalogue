import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import type { EnquiryEmail, EmailProvider } from '../src/enquiries/EmailProvider.js';
import { ProductSourceError, type Product, type ProductSource } from '../src/products/types.js';

const products: Product[] = [
  { id: 1, title: 'Backpack', price: 109.95, description: 'Fits laptops', category: "men's clothing", image: 'https://example.com/1.png', rating: { rate: 3.9, count: 120 } },
  { id: 2, title: 'T-shirt', price: 22.3, description: 'Slim fit', category: "men's clothing", image: 'https://example.com/2.png', rating: { rate: 4.1, count: 259 } },
  { id: 3, title: 'Jacket', price: 55.99, description: 'Cotton', category: "men's clothing", image: 'https://example.com/3.png', rating: { rate: 4.7, count: 500 } },
  { id: 4, title: 'Slim shirt', price: 15.99, description: 'Slim fit', category: "men's clothing", image: 'https://example.com/4.png', rating: { rate: 2.1, count: 430 } },
  { id: 5, title: 'Bracelet', price: 695, description: 'Gold', category: 'jewelery', image: 'https://example.com/5.png', rating: { rate: 4.6, count: 400 } },
  { id: 6, title: 'Ring', price: 168, description: 'White gold', category: 'jewelery', image: 'https://example.com/6.png', rating: { rate: 4.9, count: 70 } },
  { id: 7, title: 'Earrings', price: 9.99, description: 'Steel', category: 'jewelery', image: 'https://example.com/7.png', rating: { rate: 1.9, count: 100 } },
];

const source = (impl?: () => Promise<Product[]>): ProductSource => ({
  listAll: impl ?? (async () => products),
});

const makeApp = (overrides?: { source?: ProductSource; emailer?: EmailProvider }) =>
  createApp({
    source: overrides?.source ?? source(),
    emailer: overrides?.emailer ?? { send: async () => {} },
    config: { port: 0, fakeStoreApiBase: 'https://example.invalid', cacheTtlMs: 0, salesInbox: 'sales@example.com' },
  });

describe('GET /api/health', () => {
  it('reports ok', async () => {
    const res = await request(makeApp()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('GET /api/products/featured', () => {
  it('returns the 5 highest rated products', async () => {
    const res = await request(makeApp()).get('/api/products/featured');
    expect(res.status).toBe(200);
    expect(res.body.map((p: Product) => p.id)).toEqual([6, 3, 5, 2, 1]);
  });
});

describe('GET /api/products', () => {
  it('filters by search term across title and description', async () => {
    const res = await request(makeApp()).get('/api/products?search=slim');
    expect(res.status).toBe(200);
    expect(res.body.map((p: Product) => p.id)).toEqual([2, 4]);
  });

  it('filters by category, top rated first', async () => {
    const res = await request(makeApp()).get('/api/products?category=jewelery');
    expect(res.status).toBe(200);
    expect(res.body.map((p: Product) => p.id)).toEqual([6, 5, 7]);
  });
});

describe('GET /api/products/:id', () => {
  it('returns one product, 404 when unknown, 400 when not an integer', async () => {
    const app = makeApp();
    expect((await request(app).get('/api/products/1')).body.title).toBe('Backpack');
    expect((await request(app).get('/api/products/999')).status).toBe(404);
    expect((await request(app).get('/api/products/abc')).status).toBe(400);
  });
});

describe('POST /api/enquiries', () => {
  it('sends an enquiry email with the customer and product details', async () => {
    const sent: EnquiryEmail[] = [];
    const app = makeApp({ emailer: { send: async (mail) => void sent.push(mail) } });

    const res = await request(app)
      .post('/api/enquiries')
      .send({ productId: 5, name: 'Ada', email: 'ada@example.com', message: 'Is this in stock?' });

    expect(res.status).toBe(201);
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('sales@example.com');
    expect(sent[0].subject).toContain('Bracelet');
    expect(sent[0].text).toContain('Ada');
    expect(sent[0].text).toContain('ada@example.com');
    expect(sent[0].text).toContain('Is this in stock?');
  });

  it('rejects invalid input with 422 and sends nothing', async () => {
    const send = vi.fn();
    const app = makeApp({ emailer: { send } });

    const res = await request(app)
      .post('/api/enquiries')
      .send({ productId: 5, name: '', email: 'not-an-email', message: '' });

    expect(res.status).toBe(422);
    expect(send).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown product and sends nothing', async () => {
    const send = vi.fn();
    const app = makeApp({ emailer: { send } });

    const res = await request(app)
      .post('/api/enquiries')
      .send({ productId: 999, name: 'Ada', email: 'ada@example.com', message: 'Hi' });

    expect(res.status).toBe(404);
    expect(send).not.toHaveBeenCalled();
  });
});

describe('upstream failures', () => {
  it('answers 502 when the product source is down', async () => {
    const app = makeApp({ source: source(async () => Promise.reject(new ProductSourceError('boom'))) });
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(502);
    expect(res.body.error).toMatch(/unavailable/);
  });
});
