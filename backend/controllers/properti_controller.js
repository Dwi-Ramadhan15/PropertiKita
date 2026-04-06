const pool = require('../models/properti');
const fs = require('fs');
const path = require('path');

// 1. GET Detail Properti (Relational JOIN dengan Agen)
const getPropertiDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT p.*, a.nama_agen, a.no_whatsapp, a.foto_profil 
            FROM properti p 
            LEFT JOIN agen a ON p.id_agen = a.id 
            WHERE p.id = $1
        `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Properti tidak ditemukan" });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. CREATE Properti (Storage Management)
const createProperti = async (req, res) => {
    try {
        const { id_agen, judul, deskripsi, harga, lokasi, latitude, longitude } = req.body;
        const foto_path = req.file ? req.file.path : null; // Path dari multer

        const query = `
            INSERT INTO properti (id_agen, judul, deskripsi, harga, lokasi, latitude, longitude, foto_path)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `;
        const values = [id_agen, judul, deskripsi, harga, lokasi, latitude, longitude, foto_path];
        const result = await pool.query(query, values);

        res.status(201).json({ message: "Properti berhasil ditambah!", data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. DELETE Properti (Hapus Data + Hapus File Fisik)
const deleteProperti = async (req, res) => {
    try {
        const { id } = req.params;

        // Ambil path foto dulu sebelum datanya dihapus
        const getPath = await pool.query("SELECT foto_path FROM properti WHERE id = $1", [id]);
        
        if (getPath.rows.length > 0) {
            const filePath = getPath.rows[0].foto_path;
            
            // Hapus baris di DB
            await pool.query("DELETE FROM properti WHERE id = $1", [id]);

            // Hapus file fisik jika ada
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            res.status(200).json({ message: "Data dan foto berhasil dihapus!" });
        } else {
            res.status(404).json({ message: "Data tidak ada" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getPropertiDetail, createProperti, deleteProperti };