import { ProductSourceError, type Product, type ProductSource, type Rating } from './types.js';

const FETCH_TIMEOUT_MS = 5000;

/**
 * Fetches the full catalogue from the Fake Store API (or any compatible
 * service) and caches it in memory for `cacheTtlMs`.
 *
 * If a refresh fails but we still have cached data, we serve the stale copy:
 * a slightly old catalogue is a better customer experience than an error page.
 */
export class FakeStoreSource implements ProductSource {
  private cache?: { fetchedAt: number; products: Product[] };

  constructor(
    private readonly baseUrl: string,
    private readonly cacheTtlMs: number,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async listAll(): Promise<Product[]> {
    if (this.cache && Date.now() - this.cache.fetchedAt < this.cacheTtlMs) {
      return this.cache.products;
    }
    try {
      const products = await this.fetchAll();
      this.cache = { fetchedAt: Date.now(), products };
      return products;
    } catch (err) {
      if (this.cache) return this.cache.products;
      throw err instanceof ProductSourceError
        ? err
        : new ProductSourceError('Failed to load products from upstream', err);
    }
  }

  private async fetchAll(): Promise<Product[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await this.fetchImpl(`${this.baseUrl}/products`, { signal: controller.signal });
      if (!res.ok) {
        throw new ProductSourceError(`Upstream responded with status ${res.status}`);
      }
      const json: unknown = await res.json();
      if (!Array.isArray(json)) {
        throw new ProductSourceError('Upstream returned an unexpected payload');
      }
      return json.map(normalizeProduct);
    } finally {
      clearTimeout(timeout);
    }
  }
}

function normalizeProduct(raw: unknown): Product {
  if (typeof raw !== 'object' || raw === null) {
    throw new ProductSourceError('Upstream product entry is not an object');
  }
  const r = raw as Record<string, unknown>;
  if (
    typeof r.id !== 'number' ||
    typeof r.title !== 'string' ||
    typeof r.price !== 'number' ||
    typeof r.description !== 'string' ||
    typeof r.category !== 'string' ||
    typeof r.image !== 'string'
  ) {
    throw new ProductSourceError(`Upstream product has an unexpected shape: ${JSON.stringify(r.id)}`);
  }
  let rating: Rating | undefined;
  if (typeof r.rating === 'object' && r.rating !== null) {
    const rt = r.rating as Record<string, unknown>;
    if (typeof rt.rate === 'number' && typeof rt.count === 'number') {
      rating = { rate: rt.rate, count: rt.count };
    }
  }
  return {
    id: r.id,
    title: r.title,
    price: r.price,
    description: r.description,
    category: r.category,
    image: r.image,
    ...(rating ? { rating } : {}),
  };
}
