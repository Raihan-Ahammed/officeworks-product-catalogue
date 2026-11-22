import { describe, expect, it } from 'vitest';
import {
  byCategory,
  categories,
  featured,
  searchProducts,
  sortByRatingDesc,
} from '../src/products/catalogueService.js';
import type { Product } from '../src/products/types.js';

const make = (id: number, overrides: Partial<Product> = {}): Product => ({
  id,
  title: `Product ${id}`,
  price: id * 10,
  description: `Description ${id}`,
  category: id % 2 === 0 ? 'electronics' : 'jewelery',
  image: `https://example.com/${id}.png`,
  ...overrides,
});

const products: Product[] = [
  make(1, { rating: { rate: 4.0, count: 10 } }),
  make(2, { rating: { rate: 4.8, count: 5 } }),
  make(3, { rating: { rate: 4.8, count: 300 } }),
  make(4, { rating: { rate: 3.1, count: 50 } }),
  make(5, { rating: { rate: 4.9, count: 1 } }),
  make(6, { title: 'Unrated gadget' }), // no rating data
];

describe('sortByRatingDesc', () => {
  it('orders by rate, breaking ties on rating count, unrated last', () => {
    expect(sortByRatingDesc(products).map((p) => p.id)).toEqual([5, 3, 2, 1, 4, 6]);
  });

  it('does not mutate the input', () => {
    const input = [make(2), make(1)];
    sortByRatingDesc(input);
    expect(input.map((p) => p.id)).toEqual([2, 1]);
  });
});

describe('featured', () => {
  it('returns the top 5 rated products', () => {
    expect(featured(products).map((p) => p.id)).toEqual([5, 3, 2, 1, 4]);
  });
});

describe('searchProducts', () => {
  it('matches title and description case-insensitively', () => {
    const result = searchProducts([make(1, { title: 'Gold ring' }), make(2, { description: 'a GOLD watch' })], 'gold');
    expect(result.map((p) => p.id)).toEqual([1, 2]);
  });

  it('excludes non-matching products and returns all for a blank term', () => {
    expect(searchProducts([make(1)], 'no-such-text')).toEqual([]);
    expect(searchProducts(products, '   ')).toHaveLength(products.length);
  });
});

describe('byCategory', () => {
  it('filters case-insensitively and sorts top rated first', () => {
    const result = byCategory(products, 'Electronics');
    expect(result.map((p) => p.id)).toEqual([2, 4, 6]);
  });
});

describe('categories', () => {
  it('returns distinct categories sorted alphabetically', () => {
    expect(categories(products)).toEqual(['electronics', 'jewelery']);
  });
});
