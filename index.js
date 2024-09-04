const express = require('express');
const winston = require('winston');
const cors = require('cors')
const { swaggerUi, swaggerSpec } = require('./swagger');
const loginRouter = require('./login');

const app = express();
const port = 3000;

app.use(cors({credentials: true}));

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestBody: req.body,
      responseBody: res.locals.responseData // Assuming you've saved the response data in res.locals
    });
  });
  next();
});


app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/login', loginRouter);

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});

module.exports = app;
