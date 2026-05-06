const { Pool } = require('pg');
require('dotenv').config();

// Cek apakah ada DATABASE_URL (berarti lagi di Vercel / Cloud)
const poolConfig = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Wajib untuk Neon
} : {
    // Kalau jalan di laptop lokal, pakai setingan bawaan ini
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
};

const pool = new Pool(poolConfig);

pool.on('connect', () => {
    console.log('Berhasil terhubung ke database PostgreSQL PropertiKita!');
});

module.exports = pool;