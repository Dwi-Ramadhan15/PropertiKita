// Load environment variables dari .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import file route
const propertiRoute = require('./routes/properti_route');

// Import konfigurasi swagger (Pastikan file utils/swagger.js sudah ada isinya)
const { swaggerUi, specs } = require('./utils/swagger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware wajib
app.use(cors()); // Biar frontend React nanti bisa ngambil data tanpa diblokir
app.use(express.json()); // Biar bisa baca request body berformat JSON

// Setup endpoint API utama
app.use('/api', propertiRoute);

// Setup endpoint untuk dokumentasi Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Endpoint default cuma buat ngecek server jalan atau nggak
app.get('/', (req, res) => {
    res.send('Server PropertiKita Backend 1 Berjalan Normal! 🚀');
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📖 Swagger UI tersedia di http://localhost:${PORT}/api-docs`);
    console.log(`=========================================`);
});