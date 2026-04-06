const pool = require('../models/properti'); // Sesuaikan dengan koneksi DB kamu
const fs = require('fs');
const path = require('path');

const getPropertiDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Query JOIN antara properti dan agen
        const query = `
            SELECT p.*, a.nama_agen, a.no_whatsapp, a.foto_profil 
            FROM properti p 
            LEFT JOIN agen a ON p.id_agen = a.id 
            WHERE p.id = $1
        `;
        
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Yah, rumahnya nggak ketemu nih!" });
        }

        res.status(200).json({
            status: "success",
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Placeholder untuk create & delete agar tidak error dulu saat dijalankan
const createProperti = async (req, res) => { /* nanti kita isi logic upload */ };
const deleteProperti = async (req, res) => { /* nanti kita isi logic unlink file */ };

module.exports = {
    getPropertiDetail,
    createProperti,
    deleteProperti
};