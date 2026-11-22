export interface Rating {
  rate: number;
  count: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  /** Optional: the Fake Store API provides it, but we do not assume every source will. */
  rating?: Rating;
}

/**
 * Boundary between the catalogue and its product data source.
 * The Fake Store API is today's implementation; swapping in a real
 * inventory service later means implementing this interface only.
 */
export interface ProductSource {
  listAll(): Promise<Product[]>;
}

export class ProductSourceError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ProductSourceError';
    this.cause = cause;
  }
}
