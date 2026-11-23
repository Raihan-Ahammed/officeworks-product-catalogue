import type { Product } from './types.js';

const rate = (p: Product): number => p.rating?.rate ?? 0;
const ratingCount = (p: Product): number => p.rating?.count ?? 0;

/**
 * Top rated first. Ties break on the number of ratings (a 4.5 from 300
 * reviews beats a 4.5 from 3), then on id for a stable order.
 * Products without rating data rank below rated ones.
 */
export function sortByRatingDesc(products: Product[]): Product[] {
  return [...products].sort(
    (a, b) => rate(b) - rate(a) || ratingCount(b) - ratingCount(a) || a.id - b.id,
  );
}

/** The home page "top rated" picks: highest rated products across the catalogue. */
export function featured(products: Product[], count = 5): Product[] {
  return sortByRatingDesc(products).slice(0, count);
}

/** Case-insensitive substring match on title and description. */
export function searchProducts(products: Product[], term: string): Product[] {
  const q = term.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
  );
}

/** All products in a category, top rated first. */
export function byCategory(products: Product[], category: string): Product[] {
  const c = category.trim().toLowerCase();
  return sortByRatingDesc(products.filter((p) => p.category.toLowerCase() === c));
}

/** Distinct category names, sorted alphabetically. */
export function categories(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.category))].sort();
}
