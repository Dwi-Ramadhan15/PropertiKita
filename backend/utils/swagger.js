const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
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
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
