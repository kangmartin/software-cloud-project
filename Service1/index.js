const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// In-memory "Database" (Replace with MongoDB/Postgres in future steps)
let books = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "9780743273565" },
    { id: 2, title: "1984", author: "George Orwell", isbn: "9780451524935" }
];

// --- Routes ---

// Health Check (Important for Kubernetes Liveness Probes)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'book-service' });
});

// GET all books
app.get('/books', (req, res) => {
    res.status(200).json(books);
});

// GET book by ID
app.get('/books/:id', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json(book);
});

// POST a new book
app.post('/books', (req, res) => {
    const { title, author, isbn } = req.body;
    if (!title || !author) {
        return res.status(400).json({ error: 'Title and Author are required' });
    }

    const newBook = {
        id: books.length + 1,
        title,
        author,
        isbn
    };

    books.push(newBook);
    console.log(`New book added: ${title}`);
    res.status(201).json(newBook);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Book Service running on port ${PORT}`);
});