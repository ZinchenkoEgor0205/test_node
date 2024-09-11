const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.1.0',
  info: {
    title: 'Node.js Express API with Swagger',
    version: '1.0.0',
    description: 'A simple API application made with Express and documented with Swagger',
  },
  servers: [
    {
      url: 'http://localhost:8000',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./index.js', "./login.js", "./protected.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
