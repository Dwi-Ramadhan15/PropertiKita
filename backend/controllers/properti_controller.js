const db = require('../utils/db');
const minioClient = require('../utils/minio_client');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const getProperti = async(req, res) => {
    try {
        const { minHarga, maxHarga, lokasi, kamarTidur } = req.query;
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

        if (kamarTidur) {
            queryParams.push(Number(kamarTidur));
            query += ` AND kamar_tidur >= $${queryParams.length}`;
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
                    imageUrl: row.image_url,
                    kamarTidur: row.kamar_tidur
                }
            }))
        };

        res.status(200).json({ success: true, data: geoJSON });
    } catch (error) {
        console.error('Error di getProperti:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil data properti geospasial' });
    }
};

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

const createProperti = async(req, res) => {
    try {
        const { title, harga, lokasi, tipe, latitude, longitude, id_agen, kamar_tidur } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ success: false, message: "Foto wajib diunggah" });

        const bucketName = 'my-bucket';
        // ekstensi .webp
        const fileNameWithoutExt = path.parse(file.originalname).name.replace(/\s+/g, '-');
        const objectName = `${Date.now()}-${fileNameWithoutExt}.webp`;

        const webpBuffer = await sharp(file.path)
            .webp({ quality: 80 })
            .toBuffer();

        await minioClient.putObject(bucketName, objectName, webpBuffer, webpBuffer.length, {
            'Content-Type': 'image/webp'
        });

        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

        const imageUrl = `http://127.0.0.1:9000/${bucketName}/${objectName}`;

        const query = `INSERT INTO properties (title, harga, lokasi, tipe, image_url, latitude, longitude, id_agen, kamar_tidur) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
        const values = [title, harga, lokasi, tipe, imageUrl, latitude, longitude, id_agen, kamar_tidur || 0];
        const { rows } = await db.query(query, values);

        res.status(201).json({ success: true, message: "Berhasil upload dan convert ke WEBP!", data: rows[0] });
    } catch (error) {
        console.error('Error di createProperti:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProperti = async(req, res) => {
    try {
        const { id } = req.params;
        const { title, harga, lokasi, tipe, latitude, longitude, id_agen, kamar_tidur } = req.body;

        const oldData = await db.query("SELECT image_url FROM properties WHERE id = $1", [id]);
        if (oldData.rows.length === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

        let image_url = oldData.rows[0].image_url;

        if (req.file) {
            const bucketName = 'my-bucket';
            const fileNameWithoutExt = path.parse(req.file.originalname).name.replace(/\s+/g, '-');
            const objectName = `${Date.now()}-${fileNameWithoutExt}.webp`;

            const webpBuffer = await sharp(req.file.path)
                .webp({ quality: 80 })
                .toBuffer();

            await minioClient.putObject(bucketName, objectName, webpBuffer, webpBuffer.length, {
                'Content-Type': 'image/webp'
            });

            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

            image_url = `http://127.0.0.1:9000/${bucketName}/${objectName}`;
        }

        const query = `
            UPDATE properties 
            SET title=$1, harga=$2, lokasi=$3, tipe=$4, latitude=$5, longitude=$6, id_agen=$7, image_url=$8, kamar_tidur=$9
            WHERE id=$10 RETURNING *`;
        const values = [title, harga, lokasi, tipe, latitude, longitude, id_agen, image_url, kamar_tidur || 0, id];
        const { rows } = await db.query(query, values);

        res.status(200).json({ success: true, message: "Data berhasil diperbarui!", data: rows[0] });
    } catch (error) {
        console.error('Error di updateProperti:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

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

module.exports = {
    getProperti,
    getPropertiById,
    createProperti,
    updateProperti,
    deleteProperti
};