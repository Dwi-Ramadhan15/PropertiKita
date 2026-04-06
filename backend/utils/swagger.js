const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PropertiKita API Documentation',
      version: '1.0.0',
      description: 'Dokumentasi API untuk sistem manajemen properti "PropertiKita" (Backend 2)',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local server',
      },
    ],
  },
  // Path ke file yang berisi anotasi JSDoc (Routes)
  apis: ['./routes/*.js'], 
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};