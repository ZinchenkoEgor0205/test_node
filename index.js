const express = require('express');
const app = express();
const port = 10000;

let books = [
  { id: 1, title: '1984', author: 'George Orwell' },
  { id: 2, title: 'The Alchemist', author: 'Paulo Coelho' },
  { id: 3, title: 'The Da Vinci Code', author: 'Dan Brown' },
];

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to my API!');
});

app.get('/api/books', (req, res) => {
  res.json(books);
});

app.get('/api/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const book = books.find(b => b.id === bookId);

  if (!book) return res.status(404).send('Book not found');

  res.json(book);
});

app.post('/api/books', (req, res) => {
  const { title, author } = req.body;

  if (!title || !author) return res.status(400).send('Title and author are required');

  const newBook = {
    id: books.length + 1,
    title,
    author
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

// Start the server
app.listen(port, () => {
  console.log(`API server listening at http://0.0.0.0:${port}`);
});