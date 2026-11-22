import { useEffect, useState } from 'react';
import { api, type Product } from '../api';
import ProductGrid from '../components/ProductGrid';

export default function HomePage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .featured()
      .then(setProducts)
      .catch(() => setError(true));
  }, []);

  if (error) return <p role="alert">Could not load the catalogue. Please try again later.</p>;
  if (!products) return <p>Loading…</p>;

  return (
    <section>
      <h2>Top rated products</h2>
      <ProductGrid products={products} />
    </section>
  );
}
