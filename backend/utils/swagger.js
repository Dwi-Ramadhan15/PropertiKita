const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
<<<<<<< HEAD
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
=======
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PropertiKita API Documentation',
            version: '1.0.0',
            description: 'Dokumentasi RESTful API untuk Pencarian Geospasial & Manajemen Properti',
        },
        servers: [{
            url: `http://localhost:${process.env.PORT || 5000}`,
            description: 'Development Server',
        }],
    },
    apis: ['./routes/*.js'],
>>>>>>> 6f07009e609101757d963ae2098fc4fb82869913
};

const specs = swaggerJsdoc(options);

<<<<<<< HEAD
module.exports = {
  swaggerUi,
  specs,
};
=======
module.exports = { swaggerUi, specs };
>>>>>>> 6f07009e609101757d963ae2098fc4fb82869913
