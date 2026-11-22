import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, type Product } from '../api';
import ProductGrid from '../components/ProductGrid';

export default function SearchPage() {
  const [params] = useSearchParams();
  const term = params.get('q') ?? '';
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setProducts(null);
    setError(false);
    if (!term.trim()) {
      setProducts([]);
      return;
    }
    api
      .products({ search: term })
      .then(setProducts)
      .catch(() => setError(true));
  }, [term]);

  if (error) return <p role="alert">Search failed. Please try again later.</p>;
  if (!products) return <p>Searching…</p>;

  return (
    <section>
      <h2>
        {products.length} result{products.length === 1 ? '' : 's'} for &ldquo;{term}&rdquo;
      </h2>
      <ProductGrid products={products} />
    </section>
  );
}
