const db = require('../utils/db'); // Kita pakai koneksi db yang udah kamu buat sebelumnya
const minioClient = require('../utils/minio_client');
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. GET ALL (Pencarian & Filter GeoJSON) - Buatanmu
// ==========================================
const getProperti = async(req, res) => {
    try {
        const { minHarga, maxHarga, lokasi } = req.query;
        let query = 'SELECT * FROM properties WHERE 1=1';
        const queryParams = [];

        if (minHarga && maxHarga) {
            queryParams.push(Number(minHarga), Number(maxHarga));
            query += ` AND harga BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
        } else if (minHarga) {
            queryParams.push(Number(minHarga));
            query += ` AND harga >= $${queryParams.length}`;
        } else if (maxHarga) {
            queryParams.push(Number(maxHarga));
            query += ` AND harga <= $${queryParams.length}`;
        }

        if (lokasi) {
            queryParams.push(`%${lokasi}%`);
            query += ` AND lokasi ILIKE $${queryParams.length}`;
        }

        const { rows } = await db.query(query, queryParams);

        const geoJSON = {
            type: "FeatureCollection",
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
        console.error('Error di getProperti:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil data properti geospasial' });
    }
};

// ==========================================
// 2. GET BY ID (Detail Properti + Agen) - Upgrade dari Temanmu
// ==========================================
const getPropertiById = async(req, res) => {
    try {
        const { id } = req.params;
        // Query ini udah di-upgrade temenmu buat gabungin data sama tabel agen
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

// ==========================================
// 3. POST (Upload ke MinIO & Simpan DB) - Buatan Temanmu
// ==========================================
const createProperti = async(req, res) => {
    try {
        const { title, harga, lokasi, tipe, latitude, longitude, id_agen } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ success: false, message: "Foto wajib diunggah" });

        const bucketName = 'my-bucket';
        const objectName = Date.now() + '-' + file.originalname;

        // Upload file ke MinIO menggunakan path sementara dari Multer
        await minioClient.fPutObject(bucketName, objectName, file.path);

        // Hapus file fisik di folder lokal setelah berhasil ke MinIO
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

        // Simpan URL publik MinIO ke database
        const imageUrl = `http://192.168.1.16:9000/${bucketName}/${objectName}`;

        const query = `INSERT INTO properties (title, harga, lokasi, tipe, image_url, latitude, longitude, id_agen) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
        const values = [title, harga, lokasi, tipe, imageUrl, latitude, longitude, id_agen];
        const { rows } = await db.query(query, values);

        res.status(201).json({ success: true, message: "Berhasil upload ke MinIO!", data: rows[0] });
    } catch (error) {
        console.error('Error di createProperti:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 4. PUT (Update Data & Ganti Foto) - Buatan Temanmu
// ==========================================
const updateProperti = async(req, res) => {
    try {
        const { id } = req.params;
        const { title, harga, lokasi, tipe, latitude, longitude, id_agen } = req.body;

        const oldData = await db.query("SELECT image_url FROM properties WHERE id = $1", [id]);
        if (oldData.rows.length === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

        let image_url = oldData.rows[0].image_url;

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
        const { rows } = await db.query(query, values);

        res.status(200).json({ success: true, message: "Data berhasil diperbarui", data: rows[0] });
    } catch (error) {
        console.error('Error di updateProperti:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==========================================
// 5. DELETE (Hapus Data & File) - Buatan Temanmu
// ==========================================
const deleteProperti = async(req, res) => {
    try {
        const { id } = req.params;

        const dataProperti = await db.query('SELECT image_url FROM properties WHERE id = $1', [id]);
        if (dataProperti.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
        }

        const imageUrl = dataProperti.rows[0].image_url;

        if (imageUrl && !imageUrl.startsWith('http')) {
            const fileName = imageUrl.split('/').pop();
            const filePath = path.join(__dirname, '../uploads', fileName);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM properties WHERE id = $1', [id]);

        res.status(200).json({ success: true, message: "Data berhasil dihapus dari database" });
    } catch (error) {
        console.error('Error di deleteProperti:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Export semua fungsi biar bisa dipakai di router
module.exports = {
    getProperti,
    getPropertiById,
    createProperti,
    updateProperti,
    deleteProperti
};