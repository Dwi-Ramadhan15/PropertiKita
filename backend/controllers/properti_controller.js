const db = require('../utils/db');
const minioClient = require('../utils/minio_client');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

const getProperti = async(req, res) => {
    try {
        const { minHarga, maxHarga, lokasi, tipe, id_kategori, kamar_tidur, page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;
        let query = 'SELECT p.*, c.nama as nama_kategori FROM properties p LEFT JOIN categories c ON p.id_kategori = c.id WHERE 1=1';
        const queryParams = [];

        if (minHarga && maxHarga) {
            queryParams.push(Number(minHarga), Number(maxHarga));
            query += ` AND p.harga BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
        }
        if (lokasi) {
            queryParams.push(`%${lokasi}%`);
            query += ` AND p.lokasi ILIKE $${queryParams.length}`;
        }
        if (tipe) {
            queryParams.push(tipe);
            query += ` AND p.tipe = $${queryParams.length}`;
        }
        if (id_kategori) {
            queryParams.push(Number(id_kategori));
            query += ` AND p.id_kategori = $${queryParams.length}`;
        }
        if (kamar_tidur) {
            if (kamar_tidur === '4+') {
                queryParams.push(4);
                query += ` AND p.kamar_tidur >= $${queryParams.length}`;
            } else {
                queryParams.push(Number(kamar_tidur));
                query += ` AND p.kamar_tidur = $${queryParams.length}`;
            }
        }

        const countQuery = query.replace('SELECT p.*, c.nama as nama_kategori', 'SELECT COUNT(*)');
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
                    slug: row.slug,
                    title: row.title,
                    harga: row.harga,
                    lokasi: row.lokasi,
                    tipe: row.tipe,
                    kategori: row.nama_kategori,
                    kamarTidur: row.kamar_tidur,
                    kamarMandi: row.kamar_mandi,
                    luas: row.luas,
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

const getPropertiBySlug = async(req, res) => {
    try {
        const { slug } = req.params;
        const query = `
            SELECT p.*, a.nama_agen, a.no_whatsapp, a.foto_profil, c.nama as nama_kategori
            FROM properties p 
            LEFT JOIN agen a ON p.id_agen = a.id 
            LEFT JOIN categories c ON p.id_kategori = c.id
            WHERE p.slug = $1
        `;
        const { rows } = await db.query(query, [slug]);

        if (rows.length === 0) return res.status(404).json({ success: false, message: "Properti tidak ditemukan" });

        const properti = rows[0];

        const images = await db.query("SELECT image_url FROM property_images WHERE id_properti = $1", [properti.id]);
        const data = {
            ...properti,
            gallery: images.rows.map(img => img.image_url)
        };

        res.status(200).json({ success: true, data: data });
    } catch (error) {
        console.error('Error di getPropertiBySlug:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createProperti = async(req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const { title, harga, lokasi, tipe, latitude, longitude, id_agen, id_kategori, kamar_tidur, kamar_mandi, luas } = req.body;
        const files = req.files;

        if (!title || !harga || !id_kategori) {
            return res.status(400).json({ success: false, message: "Judul, Harga, dan Kategori wajib diisi!" });
        }
        if (!files || files.length === 0) return res.status(400).json({ success: false, message: "Minimal satu foto wajib diunggah!" });

        const slug = generateSlug(title);

        const query = `INSERT INTO properties (title, slug, harga, lokasi, tipe, latitude, longitude, id_agen, id_kategori, kamar_tidur, kamar_mandi, luas) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`;
        const values = [title, slug, harga, lokasi, tipe, latitude, longitude, id_agen, id_kategori, kamar_tidur || 0, kamar_mandi || 0, luas || 0];
        const resProperti = await client.query(query, values);
        const propertiId = resProperti.rows[0].id;

        const bucketName = 'my-bucket';
        for (const file of files) {
            const fileNameWithoutExt = path.parse(file.originalname).name.replace(/\s+/g, '-');
            const objectName = `${Date.now()}-${fileNameWithoutExt}.webp`;

            const webpBuffer = await sharp(file.path).webp({ quality: 80 }).toBuffer();
            await minioClient.putObject(bucketName, objectName, webpBuffer, webpBuffer.length, { 'Content-Type': 'image/webp' });

            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            const imageUrl = `http://127.0.0.1:9000/${bucketName}/${objectName}`;

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
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { title, harga, lokasi, tipe, latitude, longitude, id_agen, id_kategori, kamar_tidur, kamar_mandi, luas } = req.body;

        const checkData = await client.query("SELECT * FROM properties WHERE id = $1", [id]);
        if (checkData.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
        }
        const currentData = checkData.rows[0];

        const updatedTitle = title || currentData.title;
        const updatedSlug = title ? generateSlug(title) : currentData.slug;
        const updatedHarga = harga || currentData.harga;
        const updatedLokasi = lokasi || currentData.lokasi;
        const updatedTipe = tipe || currentData.tipe;
        const updatedLat = latitude || currentData.latitude;
        const updatedLong = longitude || currentData.longitude;
        const updatedAgen = id_agen || currentData.id_agen;
        const updatedKategori = id_kategori || currentData.id_kategori;
        const updatedKamar = kamar_tidur || currentData.kamar_tidur;
        const updatedMandi = kamar_mandi || currentData.kamar_mandi;
        const updatedLuas = luas || currentData.luas;

        const queryUpdate = `
            UPDATE properties 
            SET title=$1, slug=$2, harga=$3, lokasi=$4, tipe=$5, latitude=$6, longitude=$7, id_agen=$8, id_kategori=$9, kamar_tidur=$10, kamar_mandi=$11, luas=$12
            WHERE id=$13 RETURNING *`;
        const valuesUpdate = [updatedTitle, updatedSlug, updatedHarga, updatedLokasi, updatedTipe, updatedLat, updatedLong, updatedAgen, updatedKategori, updatedKamar, updatedMandi, updatedLuas, id];
        await client.query(queryUpdate, valuesUpdate);

        if (req.files && req.files.length > 0) {
            const bucketName = 'my-bucket';
            for (const file of req.files) {
                const fileNameWithoutExt = path.parse(file.originalname).name.replace(/\s+/g, '-');
                const objectName = `${Date.now()}-${fileNameWithoutExt}.webp`;

                const webpBuffer = await sharp(file.path).webp({ quality: 80 }).toBuffer();
                await minioClient.putObject(bucketName, objectName, webpBuffer, webpBuffer.length, { 'Content-Type': 'image/webp' });

                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                const newImageUrl = `http://127.0.0.1:9000/${bucketName}/${objectName}`;
                await client.query("INSERT INTO property_images (id_properti, image_url) VALUES ($1, $2)", [id, newImageUrl]);
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: "Berhasil update data properti!", data: updatedTitle });
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
        const check = await db.query('SELECT id FROM properties WHERE id = $1', [id]);
        if (check.rows.length === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

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
    getPropertiBySlug,
    createProperti,
    updateProperti,
    deleteProperti,
    getAgen
};