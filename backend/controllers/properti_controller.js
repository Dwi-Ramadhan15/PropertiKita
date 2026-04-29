const db = require('../utils/db');
const { minioClient } = require('../utils/minio_client');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Helper: Generate Slug
const generateSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// Helper: Ambil Real Agen ID
const getRealAgenId = async(userId, client = db) => {
    const isAgen = await client.query('SELECT id FROM agen WHERE id = $1', [userId]);
    if (isAgen.rows.length > 0) return userId;

    const userRes = await client.query('SELECT email, phone_number FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length > 0) {
        const u = userRes.rows[0];
        const agenRes = await client.query('SELECT id FROM agen WHERE email = $1 OR no_whatsapp = $2', [u.email, u.phone_number]);
        if (agenRes.rows.length > 0) return agenRes.rows[0].id;
    }
    return null;
};

// --- CORE FUNCTIONS ---

const getProperti = async(req, res) => {
    try {
        const { agen, status } = req.query;
        let query = "SELECT p.*, c.nama as nama_kategori FROM properties p LEFT JOIN categories c ON p.id_kategori = c.id WHERE 1=1";
        const queryParams = [];

        if (status && status !== 'all') {
            queryParams.push(status);
            query += ` AND p.status = $${queryParams.length}`;
        }

        if (agen) {
            const realId = await getRealAgenId(agen);
            if (realId) {
                queryParams.push(realId);
                query += ` AND p.id_agen = $${queryParams.length}`;
            }
        }

        const { rows } = await db.query(query, queryParams);
        res.status(200).json({ success: true, data: { features: rows.map(r => ({ properties: r })) } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createProperti = async(req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const { title, harga, lokasi, id_agen, fasilitas } = req.body;
        const realId = await getRealAgenId(id_agen, client);
        const slug = generateSlug(title);

        const resProp = await client.query(
            "INSERT INTO properties (title, slug, harga, lokasi, id_agen, status) VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id",
            [title, slug, harga, lokasi, realId]
        );
        const propId = resProp.rows[0].id;

        if (fasilitas) {
            const daftar = typeof fasilitas === 'string' ? JSON.parse(fasilitas) : fasilitas;
            for (const f of daftar) {
                await client.query("INSERT INTO fasilitas_properti (id_properti, nama_fasilitas) VALUES ($1, $2)", [propId, f]);
            }
        }
        await client.query('COMMIT');
        res.status(201).json({ success: true, message: "Berhasil dibuat" });
    } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ message: e.message }); }
    finally { client.release(); }
};

const updateStatusProperti = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.query("UPDATE properties SET status = $1 WHERE id = $2", [status, id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

const getNotifikasiAgen = async(req, res) => {
    try {
        const realId = await getRealAgenId(req.params.id_agen);
        const { rows } = await db.query("SELECT * FROM notifications WHERE id_agen = $1 ORDER BY created_at DESC", [realId]);
        res.json({ success: true, data: rows });
    } catch (e) { res.status(500).json({ message: e.message }); }
};


const getAllFasilitas = async (req, res) => {
    try {
        const { rows } = await db.query("SELECT * FROM fasilitas_properti ORDER BY nama_fasilitas DESC");
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createFasilitas = async (req, res) => {
    try {
        const { nama_fasilitas } = req.body;
        const result = await db.query("INSERT INTO fasilitas_properti (nama_fasilitas) VALUES ($1) RETURNING *", [nama_fasilitas]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ success: false, message: "Data duplikat" });
    }
};

const updateFasilitas = async (req, res) => {
    try {
        const { id } = req.params; 
        const { nama_fasilitas } = req.body;

        const result = await db.query(
            "UPDATE fasilitas_properti SET nama_fasilitas = $1 WHERE id = $2 RETURNING *", 
            [nama_fasilitas, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
        }
        res.status(200).json({ success: true, data: result.rows[0] }); 
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: "Gagal update fasilitas" });
    }
};

const deleteFasilitas = async (req, res) => {
    try {
        await db.query("DELETE FROM fasilitas_properti WHERE id = $1", [req.params.id]);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- ADDITIONAL FUNCTIONS (UTK SINKRONISASI ROUTE) ---

const getAgen = async (req, res) => {
    try {
        const { rows } = await db.query("SELECT * FROM agen");
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

const getPropertiBySlug = async (req, res) => {
    try {
        const { rows } = await db.query("SELECT * FROM properties WHERE slug = $1", [req.params.slug]);
        res.json(rows[0] || {});
    } catch (e) { res.status(500).json({ message: e.message }); }
};

const deleteProperti = async (req, res) => {
    try {
        await db.query("DELETE FROM properties WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

const tandaiNotifDibaca = async (req, res) => {
    try {
        await db.query("UPDATE notifications SET is_read = true WHERE id_agen = $1", [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

module.exports = {
    getProperti,
    createProperti,
    updateStatusProperti,
    getNotifikasiAgen,
    getAllFasilitas,
    createFasilitas,
    updateFasilitas,
    deleteFasilitas,
    getAgen,
    getPropertiBySlug,
    deleteProperti,
    tandaiNotifDibaca
};