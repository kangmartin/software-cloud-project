import { useEffect, useState } from 'react';
import type { Book } from './types/book';
import './App.css';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Appel relatif : l'Ingress ou le Proxy Vite se chargera du routing
    fetch('/api/books')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching books:", err);
        setError("Failed to load books");
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <h1>📚 Library Management System !!</h1>
      
      {loading && <p>Loading books...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && !error && (
        <div className="book-list">
          <h2>Catalog</h2>
          <ul>
            {books.map((book) => (
              <li key={book.id}>
                <strong>{book.title}</strong> 
                <span> by {book.author}</span>
                <small> (ISBN: {book.isbn})</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;