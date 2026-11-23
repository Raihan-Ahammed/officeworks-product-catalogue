import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [term, setTerm] = useState('');
  const navigate = useNavigate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    }
  };

  return (
    <form className="search-bar" onSubmit={onSubmit} role="search">
      <input
        type="search"
        placeholder="Search products"
        aria-label="Search products"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
}
