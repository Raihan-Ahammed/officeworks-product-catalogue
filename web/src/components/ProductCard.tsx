import { Link } from 'react-router-dom';
import type { Product } from '../api';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card-image">
        <img src={product.image} alt={product.title} loading="lazy" />
      </div>
      <div className="product-card-body">
        <h3>{product.title}</h3>
        <p className="price">${product.price.toFixed(2)}</p>
        {product.rating && (
          <p className="rating">
            ★ {product.rating.rate.toFixed(1)} ({product.rating.count})
          </p>
        )}
      </div>
    </Link>
  );
}
