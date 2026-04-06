const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API PropertiKita (Backend 1)',
            version: '1.0.0',
            description: 'Dokumentasi RESTful API untuk Pencarian Geospasial Properti',
        },
        servers: [{
            url: `http://localhost:${process.env.PORT || 5000}`,
            description: 'Development Server',
        }, ],
    },
    // Ini penting: ngasih tau Swagger buat baca komentar di folder routes
    apis: ['./routes/*_swagger.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };