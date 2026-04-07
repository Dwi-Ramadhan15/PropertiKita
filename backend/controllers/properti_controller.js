const pool = require('../models/properti');
const minioClient = require('../utils/minio_client');
const fs = require('fs');
const path = require('path'); // Perbaikan: Menambahkan modul path agar tidak error "path is not defined"

// --- 1. GET Individual Resource (Menampilkan detail properti + data agen) ---
const getPropertiDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT p.*, a.nama_agen, a.no_whatsapp, a.foto_profil 
            FROM properties p 
            LEFT JOIN agen a ON p.id_agen = a.id 
            WHERE p.id = $1
        `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) return res.status(404).json({ message: "Properti tidak ditemukan" });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 2. POST (Upload ke MinIO & Simpan ke Database) ---
const createProperti = async (req, res) => {
    try {
        const { title, harga, lokasi, tipe, latitude, longitude, id_agen } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ message: "Foto wajib diunggah" });

        const bucketName = 'my-bucket'; 
        const objectName = Date.now() + '-' + file.originalname;

        // Upload file ke MinIO menggunakan path sementara dari Multer
        await minioClient.fPutObject(bucketName, objectName, file.path);

        // Hapus file fisik di folder lokal/uploads setelah berhasil ke MinIO
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

        // Simpan URL publik MinIO ke database
        const imageUrl = `http://192.168.1.16:9000/${bucketName}/${objectName}`;
        
        const query = `INSERT INTO properties (title, harga, lokasi, tipe, image_url, latitude, longitude, id_agen) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
        const values = [title, harga, lokasi, tipe, imageUrl, latitude, longitude, id_agen];
        const result = await pool.query(query, values);

        res.status(201).json({ message: "Berhasil upload ke MinIO!", data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 3. PUT (Update Data & Kelola Foto Baru) ---
const updateProperti = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, harga, lokasi, tipe, latitude, longitude, id_agen } = req.body;

        const oldData = await pool.query("SELECT image_url FROM properties WHERE id = $1", [id]);
        if (oldData.rows.length === 0) return res.status(404).json({ message: "Data tidak ditemukan" });

        let image_url = oldData.rows[0].image_url;

        // Logika jika ada upload foto baru untuk mengganti yang lama
        if (req.file) {
            const bucketName = 'my-bucket';
            const objectName = Date.now() + '-' + req.file.originalname;

            await minioClient.fPutObject(bucketName, objectName, req.file.path);
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

            image_url = `http://192.168.1.16:9000/${bucketName}/${objectName}`;
        }

        const query = `
            UPDATE properties 
            SET title=$1, harga=$2, lokasi=$3, tipe=$4, latitude=$5, longitude=$6, id_agen=$7, image_url=$8
            WHERE id=$9 RETURNING *`;
        const values = [title, harga, lokasi, tipe, latitude, longitude, id_agen, image_url, id];
        const result = await pool.query(query, values);

        res.status(200).json({ message: "Data berhasil diperbarui", data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 4. DELETE (Hapus Data dari Database & File Lokal) ---
const deleteProperti = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cari data untuk mendapatkan path/URL file sebelum dihapus
        const dataProperti = await pool.query('SELECT image_url FROM properties WHERE id = $1', [id]);
        
        if (dataProperti.rows.length === 0) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        const imageUrl = dataProperti.rows[0].image_url;

        // Perbaikan: Hapus file lokal jika path-nya bukan URL (masih sisa-sisa upload lama)
        if (imageUrl && !imageUrl.startsWith('http')) {
            const fileName = imageUrl.split('/').pop();
            const filePath = path.join(__dirname, '../uploads', fileName);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        // Perbaikan: Menggunakan query DELETE biasa (tanpa memanggil function SQL)
        await pool.query('DELETE FROM properties WHERE id = $1', [id]);

        res.status(200).json({ message: "Data berhasil dihapus dari database" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getPropertiDetail, createProperti, updateProperti, deleteProperti };