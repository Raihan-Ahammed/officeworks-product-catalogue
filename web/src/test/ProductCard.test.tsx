import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ProductCard from '../components/ProductCard';
import type { Product } from '../api';

const product: Product = {
  id: 3,
  title: 'Cotton jacket',
  price: 55.99,
  description: 'A jacket',
  category: "men's clothing",
  image: 'https://example.com/3.png',
  rating: { rate: 4.7, count: 500 },
};

describe('ProductCard', () => {
  it('links to the product page and shows title, price and rating', () => {
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/3');
    expect(screen.getByText('Cotton jacket')).toBeInTheDocument();
    expect(screen.getByText('$55.99')).toBeInTheDocument();
    expect(screen.getByText(/4\.7 \(500\)/)).toBeInTheDocument();
  });
});
