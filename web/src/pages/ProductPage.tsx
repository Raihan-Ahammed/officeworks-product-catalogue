import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type Product } from '../api';
import EnquiryForm from '../components/EnquiryForm';

export default function ProductPage() {
  const { id = '' } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState(false);
  const [enquiring, setEnquiring] = useState(false);

  useEffect(() => {
    api
      .product(Number(id))
      .then(setProduct)
      .catch(() => setError(true));
  }, [id]);

  if (error) return <p role="alert">Could not load this product. Please try again later.</p>;
  if (!product) return <p>Loading…</p>;

  return (
    <section className="product-page">
      <div className="product-page-image">
        <img src={product.image} alt={product.title} />
      </div>
      <div className="product-page-body">
        <p className="category-label">{product.category}</p>
        <h2>{product.title}</h2>
        <p className="price">${product.price.toFixed(2)}</p>
        {product.rating && (
          <p className="rating">
            ★ {product.rating.rate.toFixed(1)} from {product.rating.count} reviews
          </p>
        )}
        <p>{product.description}</p>
        <button type="button" className="enquire-button" onClick={() => setEnquiring(true)}>
          Enquire
        </button>
      </div>

      {enquiring && (
        <div className="modal-backdrop" onClick={() => setEnquiring(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <EnquiryForm
              productId={product.id}
              productTitle={product.title}
              onSubmit={api.enquire}
              onClose={() => setEnquiring(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
}
