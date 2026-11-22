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
  rating?: Rating;
}

export interface EnquiryInput {
  productId: number;
  name: string;
  email: string;
  message: string;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  categories: () => get<string[]>('/api/categories'),
  featured: () => get<Product[]>('/api/products/featured'),
  products: (params: { search?: string; category?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.search?.trim()) qs.set('search', params.search.trim());
    if (params.category?.trim()) qs.set('category', params.category.trim());
    const suffix = qs.toString();
    return get<Product[]>(`/api/products${suffix ? `?${suffix}` : ''}`);
  },
  product: (id: number) => get<Product>(`/api/products/${id}`),
  enquire: async (input: EnquiryInput): Promise<void> => {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? `Request failed with status ${res.status}`);
    }
  },
};
