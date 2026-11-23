import express, { type NextFunction, type Request, type Response } from 'express';
import { byCategory, categories, featured, searchProducts } from './products/catalogueService.js';
import { ProductSourceError, type ProductSource } from './products/types.js';
import type { EmailProvider } from './enquiries/EmailProvider.js';
import { enquirySchema } from './enquiries/enquirySchema.js';
import type { AppConfig } from './config.js';

interface AppDeps {
  source: ProductSource;
  emailer: EmailProvider;
  config: AppConfig;
}

const asyncH =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export function createApp({ source, emailer, config }: AppDeps) {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get(
    '/api/categories',
    asyncH(async (_req, res) => {
      res.json(categories(await source.listAll()));
    }),
  );

  // Registered before /api/products/:id so "featured" is not parsed as an id.
  app.get(
    '/api/products/featured',
    asyncH(async (_req, res) => {
      res.json(featured(await source.listAll(), 5));
    }),
  );

  app.get(
    '/api/products',
    asyncH(async (req, res) => {
      let products = await source.listAll();
      const { search, category } = req.query;
      if (typeof category === 'string' && category.trim()) {
        products = byCategory(products, category);
      }
      if (typeof search === 'string' && search.trim()) {
        products = searchProducts(products, search);
      }
      res.json(products);
    }),
  );

  app.get(
    '/api/products/:id',
    asyncH(async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: 'Invalid product id' });
        return;
      }
      const product = (await source.listAll()).find((p) => p.id === id);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(product);
    }),
  );

  app.post(
    '/api/enquiries',
    asyncH(async (req, res) => {
      const parsed = enquirySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({
          error: 'Validation failed',
          details: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        });
        return;
      }
      const product = (await source.listAll()).find((p) => p.id === parsed.data.productId);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      await emailer.send({
        to: config.salesInbox,
        subject: `Product enquiry: ${product.title}`,
        text: [
          `Name: ${parsed.data.name}`,
          `Email: ${parsed.data.email}`,
          `Product: ${product.title} (id ${product.id}, $${product.price.toFixed(2)})`,
          '',
          parsed.data.message,
        ].join('\n'),
      });
      res.status(201).json({ ok: true });
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ProductSourceError) {
      res.status(502).json({ error: 'Product catalogue is temporarily unavailable' });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
