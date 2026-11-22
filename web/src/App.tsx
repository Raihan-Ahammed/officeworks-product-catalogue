import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { api } from './api';
import SearchBar from './components/SearchBar';
import CategoryPage from './pages/CategoryPage';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';

export default function App() {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <div className="app">
      <header className="header">
        <Link to="/" className="logo">
          Catalogue
        </Link>
        <SearchBar />
      </header>
      <nav className="category-nav">
        {categories.map((c) => (
          <NavLink key={c} to={`/category/${encodeURIComponent(c)}`}>
            {c}
          </NavLink>
        ))}
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:name" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
        </Routes>
      </main>
    </div>
  );
}
