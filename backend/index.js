require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors'); // Tambahkan ini agar frontend bisa akses API
const propertiRoutes = require('./routes/properti_route');
const { swaggerUi, specs } = require('./utils/swagger');

const app = express();

// --- Middleware ---
app.use(cors()); // Mengizinkan akses dari domain berbeda (Penting buat integrasi Frontend)
app.use(express.json()); // Supaya bisa baca request body format JSON
app.use(express.urlencoded({ extended: true })); // Supaya bisa baca form-data sederhana

// --- Static Files ---
// Folder 'uploads' dibuat statis agar foto bisa diakses via browser
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use('/api/properti', propertiRoutes);

// --- Swagger Documentation ---
// Akses dokumentasi di http://localhost:5000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// --- Server Configuration ---
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Selamat Datang di API PropertiKita! Silakan buka /api-docs untuk dokumentasi.');
});

app.listen(PORT, () => {
    console.log(`\n================================================`);
    console.log(`🚀 Server PropertiKita Berhasil Dijalankan!`);
    console.log(`🏠 Local Server : http://localhost:${PORT}`);
    console.log(`📖 Swagger Docs  : http://localhost:${PORT}/api-docs`);
    console.log(`================================================\n`);
    console.log(`Gaspol, Diah! Semoga projeknya lancar jaya! 🔥✨`);
});