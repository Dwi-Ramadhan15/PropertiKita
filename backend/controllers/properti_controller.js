const db = require('../utils/db');
const minioClient = require('../utils/minio_client');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Ambil Semua Properti (GeoJSON untuk Map)
const getProperti = async(req, res) => {
    try {
        // 1. Ambil query parameter untuk filter & pagination
        const { minHarga, maxHarga, lokasi, tipe, page = 1, limit = 10 } = req.query;
        
        // Hitung offset (data ke berapa yang mulai diambil)
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM properties WHERE 1=1';
        const queryParams = [];

        // --- FILTER HARGA, LOKASI, TIPE (Sama seperti sebelumnya) ---
        if (minHarga && maxHarga) {
            queryParams.push(Number(minHarga), Number(maxHarga));
            query += ` AND harga BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
        }
        if (lokasi) {
            queryParams.push(`%${lokasi}%`);
            query += ` AND lokasi ILIKE $${queryParams.length}`;
        }
        if (tipe) {
            queryParams.push(tipe);
            query += ` AND tipe = $${queryParams.length}`;
        }

        // --- TAMBAHAN PAGINATION ---
        // Simpan query dasar untuk hitung total data (tanpa limit & offset)
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
        const totalDataRes = await db.query(countQuery, queryParams);
        const totalData = parseInt(totalDataRes.rows[0].count);

        // Tambahkan LIMIT dan OFFSET ke query utama
        queryParams.push(Number(limit), Number(offset));
        query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

        const { rows } = await db.query(query, queryParams);

        // Bungkus ke GeoJSON
        const geoJSON = {
            type: "FeatureCollection",
            totalData: totalData,
            currentPage: Number(page),
            totalPages: Math.ceil(totalData / limit),
            features: rows.map(row => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)]
                },
                properties: {
                    id: row.id,
                    title: row.title,
                    harga: row.harga,
                    lokasi: row.lokasi,
                    tipe: row.tipe,
                    imageUrl: row.image_url
                }
            }))
        };

        res.status(200).json({ success: true, data: geoJSON });
    } catch (error) {
        console.error('Error di getProperti (Pagination):', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Ambil Properti Berdasarkan ID (Join dengan Agen)
const getPropertiById = async(req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT p.*, a.nama_agen, a.no_whatsapp, a.foto_profil 
            FROM properties p 
            LEFT JOIN agen a ON p.id_agen = a.id 
            WHERE p.id = $1
        `;
        const { rows } = await db.query(query, [id]);

        if (rows.length === 0) return res.status(404).json({ success: false, message: "Properti tidak ditemukan" });

        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error di getPropertiById:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Tambah Properti Baru (Upload ke MinIO & Convert ke WebP)
const createProperti = async(req, res) => {
    try {
        const { title, harga, lokasi, tipe, latitude, longitude, id_agen } = req.body;
        const file = req.file;

        // --- VALIDASI SATPAM ---
        if (!title || title.trim() === "") return res.status(400).json({ success: false, message: "Judul properti wajib diisi!" });
        if (!harga || harga <= 0) return res.status(400).json({ success: false, message: "Harga harus berupa angka dan lebih dari 0!" });
        if (!file) return res.status(400).json({ success: false, message: "Foto wajib diunggah, Diah!" });
        if (!latitude || !longitude) return res.status(400).json({ success: false, message: "Titik koordinat (Lat/Long) belum ditentukan." });

        // Cek apakah ID Agen valid (Mencegah error Foreign Key)
        const checkAgen = await db.query("SELECT id FROM agen WHERE id = $1", [id_agen]);
        if (checkAgen.rows.length === 0) {
            return res.status(400).json({ success: false, message: "ID Agen tidak ditemukan di database!" });
        }

        const bucketName = 'my-bucket';
        const fileNameWithoutExt = path.parse(file.originalname).name.replace(/\s+/g, '-');
        const objectName = `${Date.now()}-${fileNameWithoutExt}.webp`;

        const webpBuffer = await sharp(file.path).webp({ quality: 80 }).toBuffer();
        await minioClient.putObject(bucketName, objectName, webpBuffer, webpBuffer.length, { 'Content-Type': 'image/webp' });

        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        const imageUrl = `http://127.0.0.1:9000/${bucketName}/${objectName}`;

        const query = `INSERT INTO properties (title, harga, lokasi, tipe, image_url, latitude, longitude, id_agen) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
        const values = [title, harga, lokasi, tipe, imageUrl, latitude, longitude, id_agen];
        const { rows } = await db.query(query, values);

        res.status(201).json({ success: true, message: "Data berhasil disimpan dengan aman!", data: rows[0] });
    } catch (error) {
        console.error('Error di createProperti:', error);
        res.status(500).json({ success: false, message: "Terjadi kesalahan sistem: " + error.message });
    }
};
// 4. Update Data Properti
const updateProperti = async(req, res) => {
    try {
        const { id } = req.params;
        const { title, harga, lokasi, tipe, latitude, longitude, id_agen } = req.body;

        // 1. Cari data lama dulu (Buat cadangan kalau ada yang nggak diisi)
        const checkData = await db.query("SELECT * FROM properties WHERE id = $1", [id]);
        if (checkData.rows.length === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
        
        const currentData = checkData.rows[0];

        // 2. LOGIKA "PINTAR": Kalau input kosong, pakai yang lama
        const updatedTitle = title || currentData.title;
        const updatedHarga = harga || currentData.harga;
        const updatedLokasi = lokasi || currentData.lokasi;
        const updatedTipe = tipe || currentData.tipe;
        const updatedLat = latitude || currentData.latitude;
        const updatedLong = longitude || currentData.longitude;
        const updatedAgen = id_agen || currentData.id_agen;

        if (updatedAgen) {
            const checkAgen = await db.query("SELECT id FROM agen WHERE id = $1", [updatedAgen]);
            if (checkAgen.rows.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Agen dengan ID ${updatedAgen} nggak ada, sobbb. Cek lagi ya!` 
                });
            }
        }

        // 3. VALIDASI (Tetap harus ada biar nggak minus)
        if (updatedHarga < 0) return res.status(400).json({ success: false, message: "Harga nggak boleh minus ya!" });

        let image_url = currentData.image_url;
        const bucketName = 'my-bucket';

        // 4. LOGIKA FOTO (Hanya ganti kalau ada file baru diupload)
        if (req.file) {
            // Hapus foto lama di MinIO
            if (image_url) {
                const oldFileName = image_url.split('/').pop();
                try {
                    await minioClient.removeObject(bucketName, oldFileName);
                } catch (err) { console.log("Foto lama sudah tidak ada di storage."); }
            }

            // Upload foto baru
            const fileNameWithoutExt = path.parse(req.file.originalname).name.replace(/\s+/g, '-');
            const objectName = `${Date.now()}-${fileNameWithoutExt}.webp`;
            const webpBuffer = await sharp(req.file.path).webp({ quality: 80 }).toBuffer();

            await minioClient.putObject(bucketName, objectName, webpBuffer, webpBuffer.length, {
                'Content-Type': 'image/webp'
            });

            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            image_url = `http://127.0.0.1:9000/${bucketName}/${objectName}`;
        }

        // 5. UPDATE KE DATABASE
        const query = `
            UPDATE properties 
            SET title=$1, harga=$2, lokasi=$3, tipe=$4, latitude=$5, longitude=$6, id_agen=$7, image_url=$8
            WHERE id=$9 RETURNING *`;
        
        const values = [updatedTitle, updatedHarga, updatedLokasi, updatedTipe, updatedLat, updatedLong, updatedAgen, image_url, id];
        const { rows } = await db.query(query, values);

        res.status(200).json({ success: true, message: "Berhasil update data yang kamu pilih saja!", data: rows[0] });
    } catch (error) {
        console.error('Error di updateProperti:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// 5. Hapus Properti
const deleteProperti = async(req, res) => {
    try {
        const { id } = req.params;

        const dataProperti = await db.query('SELECT image_url FROM properties WHERE id = $1', [id]);
        if (dataProperti.rows.length === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

        // Proses hapus dari database
        await db.query('DELETE FROM properties WHERE id = $1', [id]);

        res.status(200).json({ success: true, message: "Data berhasil dihapus!" });
    } catch (error) {
        console.error('Error di deleteProperti:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Ambil Daftar Agen (Dropdown)
const getAgen = async (req, res) => {
    try {
        const query = 'SELECT id, nama_agen, no_whatsapp, foto_profil FROM agen ORDER BY nama_agen ASC';
        const { rows } = await db.query(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('Error di getAgen:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getProperti,
    getPropertiById,
    createProperti,
    updateProperti,
    deleteProperti,
    getAgen
};