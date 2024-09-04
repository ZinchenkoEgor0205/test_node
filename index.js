const express = require('express');
const { swaggerUi, swaggerSpec } = require('./swagger');
const loginRouter = require('./login');

const app = express();
const port = 3000;

app.use(express.json());

let books = [
  { id: 1, title: '1984', author: 'George Orwell' },
  { id: 2, title: 'The Alchemist', author: 'Paulo Coelho' },
  { id: 3, title: 'The Da Vinci Code', author: 'Dan Brown' },
];

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/login', loginRouter);

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});

module.exports = app;
