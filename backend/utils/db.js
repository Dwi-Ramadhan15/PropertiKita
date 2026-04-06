const { Pool } = require('pg');
require('dotenv').config();

// Koneksi otomatis membaca process.env yang kita atur tadi
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Tes koneksi (Opsional, biar kelihatan di terminal pas server nyala)
pool.on('connect', () => {
    console.log('Berhasil terhubung ke database PostgreSQL PropertiKita!');
});

module.exports = pool;