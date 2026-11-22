import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type Product } from '../api';
import ProductGrid from '../components/ProductGrid';

const TOP_RATED_COUNT = 5;

export default function CategoryPage() {
  const { name = '' } = useParams();
  const category = decodeURIComponent(name);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setProducts(null);
    setError(false);
    api
      .products({ category })
      .then(setProducts)
      .catch(() => setError(true));
  }, [category]);

  if (error) return <p role="alert">Could not load this category. Please try again later.</p>;
  if (!products) return <p>Loading…</p>;
  if (products.length === 0) return <p>No products found in {category}.</p>;

  // The backend returns category products top rated first.
  const topRated = products.slice(0, TOP_RATED_COUNT);
  const rest = products.slice(TOP_RATED_COUNT);

  return (
    <section>
      <h2>{category}</h2>
      <h3>Top rated in {category}</h3>
      <ProductGrid products={topRated} />
      {rest.length > 0 && (
        <>
          <h3>More in {category}</h3>
          <ProductGrid products={rest} />
        </>
      )}
    </section>
  );
}
