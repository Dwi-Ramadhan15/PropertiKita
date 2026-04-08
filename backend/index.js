// Load environment variables dari .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path'); // Tambahan dari temenmu buat ngurus path folder

// Import file route
const propertiRoute = require('./routes/properti_route');

// Import konfigurasi swagger
const { swaggerUi, specs } = require('./utils/swagger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware wajib
app.use(cors());
app.use(express.json());

// Middleware untuk bikin folder 'uploads' dari temenmu bisa diakses secara publik (buat nampilin foto)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup endpoint API utama
app.use('/api', propertiRoute);

// Setup endpoint untuk dokumentasi Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Endpoint default 
app.get('/', (req, res) => {
    res.send('Server PropertiKita Berjalan Normal! 🚀');
});

// Letakkan ini setelah semua route
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Opps! Ada masalah di server, Diah sedang memperbaikinya.",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📖 Swagger UI tersedia di http://localhost:${PORT}/api-docs`);
    console.log(`=========================================`);
});