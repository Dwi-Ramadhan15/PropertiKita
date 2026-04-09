const db = require('../utils/db');
const minioClient = require('../utils/minio_client');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const getProperti = async(req, res) => {
    try {
        const { minHarga, maxHarga, lokasi, tipe, kamar_tidur, page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM properties WHERE 1=1';
        const queryParams = [];

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
        if (kamar_tidur) {
            if (kamar_tidur === '4+') {
                queryParams.push(4);
                query += ` AND kamar_tidur >= $${queryParams.length}`;
            } else {
                queryParams.push(Number(kamar_tidur));
                query += ` AND kamar_tidur = $${queryParams.length}`;
            }
        }

        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
        const totalDataRes = await db.query(countQuery, queryParams);
        const totalData = parseInt(totalDataRes.rows[0].count);

        queryParams.push(Number(limit), Number(offset));
        query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

        const { rows } = await db.query(query, queryParams);

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
                    kamarTidur: row.kamar_tidur,
                    kamarMandi: row.kamar_mandi, // BARU
                    luas: row.luas, // BARU
                    imageUrl: row.image_url
                }
            }))
        };

        res.status(200).json({ success: true, data: geoJSON });
    } catch (error) {
        console.error('Error di getProperti:', error);
        res.status(500).json({ success: false, message: error.message });
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
    const client = await db.connect(); // Gunakan transaction agar data konsisten
    try {
        await client.query('BEGIN');

        const { title, harga, lokasi, tipe, latitude, longitude, id_agen, kamar_tidur, kamar_mandi, luas } = req.body;
        // Ganti req.file jadi req.files karena sekarang fotonya banyak
        const files = req.files; 

        // --- VALIDASI REQUIRE ---
        if (!title || title.trim() === "") return res.status(400).json({ success: false, message: "Judul properti wajib diisi!" });
        if (!harga || harga <= 0) return res.status(400).json({ success: false, message: "Harga harus berupa angka dan lebih dari 0!" });
        if (!files || files.length === 0) return res.status(400).json({ success: false, message: "Minimal satu foto wajib diunggah!" });
        if (!latitude || !longitude) return res.status(400).json({ success: false, message: "Titik koordinat (Lat/Long) belum ditentukan." });

        const checkAgen = await client.query("SELECT id FROM agen WHERE id = $1", [id_agen]);
        if (checkAgen.rows.length === 0) {
            return res.status(400).json({ success: false, message: "ID Agen tidak ditemukan!" });
        }

        // 1. INSERT DATA UTAMA KE TABEL PROPERTIES
        const query = `INSERT INTO properties (title, harga, lokasi, tipe, latitude, longitude, id_agen, kamar_tidur, kamar_mandi, luas) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`;
        const values = [title, harga, lokasi, tipe, latitude, longitude, id_agen, kamar_tidur || 0, kamar_mandi || 0, luas || 0];
        const resProperti = await client.query(query, values);
        const propertiId = resProperti.rows[0].id;

        // 2. PROSES SEMUA FOTO (LOOPING)
        const bucketName = 'my-bucket';
        for (const file of files) {
            const fileNameWithoutExt = path.parse(file.originalname).name.replace(/\s+/g, '-');
            const objectName = `${Date.now()}-${fileNameWithoutExt}.webp`;

            const webpBuffer = await sharp(file.path).webp({ quality: 80 }).toBuffer();
            await minioClient.putObject(bucketName, objectName, webpBuffer, webpBuffer.length, { 'Content-Type': 'image/webp' });

            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            const imageUrl = `http://127.0.0.1:9000/${bucketName}/${objectName}`;

            // Simpan setiap URL foto ke tabel terpisah (asumsi tabel: property_images)
            await client.query(`INSERT INTO property_images (id_properti, image_url) VALUES ($1, $2)`, [propertiId, imageUrl]);
        }

        await client.query('COMMIT');
        res.status(201).json({ success: true, message: "Data dan semua foto berhasil disimpan!" });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error di createProperti:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

const updateProperti = async(req, res) => {
    const client = await db.connect(); // Gunakan transaction agar update data & foto sinkron
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { title, harga, lokasi, tipe, latitude, longitude, id_agen, kamar_tidur, kamar_mandi, luas } = req.body;

        // 1. Cek data lama
        const checkData = await client.query("SELECT * FROM properties WHERE id = $1", [id]);
        if (checkData.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
        }
        const currentData = checkData.rows[0];

        // 2. Logic Partial Update (Fallback ke data lama jika input kosong)
        const updatedTitle = title || currentData.title;
        const updatedHarga = harga || currentData.harga;
        const updatedLokasi = lokasi || currentData.lokasi;
        const updatedTipe = tipe || currentData.tipe;
        const updatedLat = latitude || currentData.latitude;
        const updatedLong = longitude || currentData.longitude;
        const updatedAgen = id_agen || currentData.id_agen;
        const updatedKamar = kamar_tidur || currentData.kamar_tidur;
        const updatedMandi = kamar_mandi || currentData.kamar_mandi;
        const updatedLuas = luas || currentData.luas;

        // Validasi Foreign Key Agen
        if (updatedAgen) {
            const checkAgen = await client.query("SELECT id FROM agen WHERE id = $1", [updatedAgen]);
            if (checkAgen.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ success: false, message: `Agen dengan ID ${updatedAgen} tidak ada!` });
            }
        }

        if (updatedHarga < 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: "Harga tidak boleh minus!" });
        }

        // 3. Update Data Utama
        const queryUpdate = `
            UPDATE properties 
            SET title=$1, harga=$2, lokasi=$3, tipe=$4, latitude=$5, longitude=$6, id_agen=$7, kamar_tidur=$8, kamar_mandi=$9, luas=$10
            WHERE id=$11 RETURNING *`;
        const valuesUpdate = [updatedTitle, updatedHarga, updatedLokasi, updatedTipe, updatedLat, updatedLong, updatedAgen, updatedKamar, updatedMandi, updatedLuas, id];
        await client.query(queryUpdate, valuesUpdate);

        // 4. Logic Multiple Images (Jika ada foto baru diupload)
        // Pakai req.files (jamak) agar bisa banyak foto untuk slider
        if (req.files && req.files.length > 0) {
            const bucketName = 'my-bucket';
            
            for (const file of req.files) {
                const fileNameWithoutExt = path.parse(file.originalname).name.replace(/\s+/g, '-');
                const objectName = `${Date.now()}-${fileNameWithoutExt}.webp`;
                
                const webpBuffer = await sharp(file.path).webp({ quality: 80 }).toBuffer();
                await minioClient.putObject(bucketName, objectName, webpBuffer, webpBuffer.length, {
                    'Content-Type': 'image/webp'
                });

                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                const newImageUrl = `http://127.0.0.1:9000/${bucketName}/${objectName}`;

                // Masukkan foto-foto baru ke tabel gallery/images
                await client.query(
                    "INSERT INTO property_images (id_properti, image_url) VALUES ($1, $2)",
                    [id, newImageUrl]
                );
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: "Berhasil update data dan menambah foto gallery!", data: updatedTitle });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error di updateProperti:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

const deleteProperti = async(req, res) => {
    try {
        const { id } = req.params;

        const dataProperti = await db.query('SELECT image_url FROM properties WHERE id = $1', [id]);
        if (dataProperti.rows.length === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

        await db.query('DELETE FROM properties WHERE id = $1', [id]);

        res.status(200).json({ success: true, message: "Data berhasil dihapus!" });
    } catch (error) {
        console.error('Error di deleteProperti:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAgen = async(req, res) => {
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