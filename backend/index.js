// Load environment variables dari .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// --- IMPORT ROUTES ---
const userRoute = require('./routes/user_route');
const categoryRoutes = require('./routes/category_route');
const propertiRoute = require('./routes/properti_route');

// Import konfigurasi swagger
const { swaggerUi, specs } = require('./utils/swagger');

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Middleware untuk akses file statis (foto di folder uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- SETUP ENDPOINT API ---

// 1. Endpoint Properti & Agen (Akses via /api/properti dan /api/agen)
app.use('/api', propertiRoute);

// 2. Endpoint Kategori (Akses via /api/categories)
app.use('/api/categories', categoryRoutes);

// 3. Endpoint User (Akses via /api/users/register, /api/users/login, dll)
app.use('/api/users', userRoute);

// 4. Setup Dokumentasi Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Endpoint default (Check Health)
app.get('/', (req, res) => {
    res.send('Server PropertiKita Berjalan Normal! 🚀');
});

// --- ERROR HANDLING MIDDLEWARE ---
// Letakkan ini setelah semua route agar bisa menangkap error dari mana saja
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Opps! Ada masalah di server, sedang diperbaiki.",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// --- JALANKAN SERVER ---
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
    console.log(`📖 Swagger UI tersedia di http://localhost:${PORT}/api-docs`);
    console.log(`=========================================`);
});