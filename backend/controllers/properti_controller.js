const db = require('../utils/db');
const { minioClient } = require('../utils/minio_client');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
};

const getRealAgenId = async(userId, client = db) => {
    const isAgen = await client.query('SELECT id FROM agen WHERE id = $1', [userId]);
    if (isAgen.rows.length > 0) {
        return userId;
    }

    const userRes = await client.query('SELECT email, phone_number FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length > 0) {
        const u = userRes.rows[0];
        const agenRes = await client.query('SELECT id FROM agen WHERE email = $1 OR no_whatsapp = $2', [u.email, u.phone_number]);
        if (agenRes.rows.length > 0) {
            return agenRes.rows[0].id;
        }
    }
    return null;
};

const getProperti = async(req, res) => {
    try {
        const { minHarga, maxHarga, lokasi, tipe, id_kategori, kamar_tidur, agen, status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = "SELECT p.*, c.nama as nama_kategori FROM properties p LEFT JOIN categories c ON p.id_kategori = c.id WHERE 1=1";
        const queryParams = [];

        if (status && status !== 'all') {
            queryParams.push(status);
            query += ` AND p.status = $${queryParams.length}`;
        } else if (!status) {
            query += ` AND p.status = 'approved'`;
        }

        if (agen) {
            const realAgenId = await getRealAgenId(agen);
            if (!realAgenId) {
                return res.status(200).json({
                    success: true,
                    data: { type: "FeatureCollection", totalData: 0, currentPage: Number(page), totalPages: 0, features: [] }
                });
            }
            queryParams.push(Number(realAgenId));
            query += ` AND p.id_agen = $${queryParams.length}`;
        }

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

        const propertyIds = rows.map(r => r.id);
        let fasilitasMap = {};

        if (propertyIds.length > 0) {
            const fasRes = await db.query(
                "SELECT id_properti, nama_fasilitas FROM fasilitas_properti WHERE id_properti = ANY($1)",
                [propertyIds]
            );
            fasRes.rows.forEach(f => {
                if (!fasilitasMap[f.id_properti]) fasilitasMap[f.id_properti] = [];
                fasilitasMap[f.id_properti].push(f.nama_fasilitas);
            });
        }

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
                    ...row,
                    kategori: row.nama_kategori,
                    imageUrl: row.image_url,
                    fasilitas: fasilitasMap[row.id] || []
                }
            }))
        };

        res.status(200).json({ success: true, data: geoJSON });
    } catch (error) {
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
        const fasRes = await db.query("SELECT nama_fasilitas FROM fasilitas_properti WHERE id_properti = $1", [properti.id]);

        res.status(200).json({
            success: true,
            data: {
                ...properti,
                gallery: images.rows.map(img => img.image_url),
                fasilitas: fasRes.rows.map(f => f.nama_fasilitas)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createProperti = async(req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const { title, harga, lokasi, tipe, latitude, longitude, id_agen, id_kategori, kamar_tidur, kamar_mandi, luas, deskripsi, fasilitas } = req.body;
        const files = req.files;

        if (!title || !harga || !id_kategori) {
            return res.status(400).json({ success: false, message: "Judul, Harga, dan Kategori wajib diisi!" });
        }
        if (!files || files.length < 2) {
            return res.status(400).json({ success: false, message: "Minimal dua foto wajib diunggah!" });
        }

        const realAgenId = await getRealAgenId(id_agen, client);
        if (!realAgenId) {
            return res.status(400).json({ success: false, message: "Profil agen tidak valid!" });
        }

        const slug = generateSlug(title);
        const bucketName = 'propertikita';

        const query = `INSERT INTO properties (title, slug, harga, lokasi, tipe, latitude, longitude, id_agen, id_kategori, kamar_tidur, kamar_mandi, luas, deskripsi, status) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending') RETURNING id`;

        const values = [
            title, slug, harga, lokasi, tipe, latitude, longitude, realAgenId, id_kategori,
            kamar_tidur || 0, kamar_mandi || 0, luas || 0, deskripsi || ''
        ];

        const resProperti = await client.query(query, values);
        const propertiId = resProperti.rows[0].id;

        if (fasilitas) {
            const daftarFasilitas = typeof fasilitas === 'string' ? JSON.parse(fasilitas) : fasilitas;
            for (const f of daftarFasilitas) {
                await client.query(`INSERT INTO fasilitas_properti (id_properti, nama_fasilitas) VALUES ($1, $2)`, [propertiId, f]);
            }
        }

        let firstImageUrl = '';
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const objectName = `${Date.now()}-${path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g, '-')}.webp`;
            const webpBuffer = await sharp(file.path).webp({ quality: 80 }).toBuffer();
            await minioClient.putObject(bucketName, objectName, webpBuffer, { 'Content-Type': 'image/webp' });
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            const imageUrl = `http://127.0.0.1:9000/${bucketName}/${objectName}`;
            if (i === 0) firstImageUrl = imageUrl;
            await client.query(`INSERT INTO property_images (id_properti, image_url) VALUES ($1, $2)`, [propertiId, imageUrl]);
        }

        await client.query(`UPDATE properties SET image_url = $1 WHERE id = $2`, [firstImageUrl, propertiId]);
        await client.query('COMMIT');
        res.status(201).json({ success: true, message: "Properti berhasil dikirim!" });
    } catch (error) {
        await client.query('ROLLBACK');
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
        const { title, harga, lokasi, tipe, latitude, longitude, id_agen, id_kategori, kamar_tidur, kamar_mandi, luas, deskripsi, fasilitas, status } = req.body;

        const checkData = await client.query("SELECT * FROM properties WHERE id = $1", [id]);
        if (checkData.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
        }

        const current = checkData.rows[0];
        const slug = title ? generateSlug(title) : current.slug;
        let realAgenId = current.id_agen;
        if (id_agen) {
            const checkedAgen = await getRealAgenId(id_agen, client);
            if (checkedAgen) realAgenId = checkedAgen;
        }

        const queryUpdate = `
            UPDATE properties 
            SET title=$1, slug=$2, harga=$3, lokasi=$4, tipe=$5, latitude=$6, longitude=$7, id_agen=$8, id_kategori=$9, kamar_tidur=$10, kamar_mandi=$11, luas=$12, deskripsi=$13, status=$14
            WHERE id=$15`;

        const valuesUpdate = [
            title || current.title, slug, harga || current.harga, lokasi || current.lokasi, tipe || current.tipe,
            latitude || current.latitude, longitude || current.longitude, realAgenId,
            id_kategori || current.id_kategori, kamar_tidur || current.kamar_tidur, kamar_mandi || current.kamar_mandi,
            luas || current.luas, deskripsi || current.deskripsi, status || current.status, id
        ];

        await client.query(queryUpdate, valuesUpdate);

        if (fasilitas) {
            const daftarFasilitas = typeof fasilitas === 'string' ? JSON.parse(fasilitas) : fasilitas;
            await client.query(`DELETE FROM fasilitas_properti WHERE id_properti = $1`, [id]);
            for (const f of daftarFasilitas) {
                await client.query(`INSERT INTO fasilitas_properti (id_properti, nama_fasilitas) VALUES ($1, $2)`, [id, f]);
            }
        }

        if (req.files && req.files.length > 0) {
            const bucketName = 'propertikita';
            for (const file of req.files) {
                const objectName = `${Date.now()}-${path.parse(file.originalname).name.replace(/[^a-zA-Z0-9]/g, '-')}.webp`;
                const webpBuffer = await sharp(file.path).webp({ quality: 80 }).toBuffer();
                await minioClient.putObject(bucketName, objectName, webpBuffer, { 'Content-Type': 'image/webp' });
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                const imageUrl = `http://127.0.0.1:9000/${bucketName}/${objectName}`;
                await client.query("INSERT INTO property_images (id_properti, image_url) VALUES ($1, $2)", [id, imageUrl]);
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ success: true, message: "Berhasil update data properti!" });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: error.message });
    } finally {
        client.release();
    }
};

const updateStatusProperti = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending', 'sold'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status tidak valid" });
    }
    const query = "UPDATE properties SET status = $1 WHERE id = $2 RETURNING title, id_agen";
    const result = await db.query(query, [status, id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
    const properti = result.rows[0];
    if (req.io) {
      const roomName = `agen_${properti.id_agen}`;
      let msg = status === 'approved' ? `Listing "${properti.title}" DISETUJUI.` : status === 'rejected' ? `Listing "${properti.title}" DITOLAK.` : `Status "${properti.title}" TERJUAL.`;
      req.io.to(roomName).emit('notify_agen', { status, message: msg, title: properti.title });
    }
    res.status(200).json({ success: true, message: `Status berhasil diubah`, data: properti });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAgen = async(req, res) => {
    try {
        const query = `
            SELECT a.id, a.nama_agen, a.no_whatsapp, a.foto_profil, 
            COUNT(p.id) as total_properti
            FROM agen a
            LEFT JOIN properties p ON a.id = p.id_agen AND p.status = 'approved'
            GROUP BY a.id
            ORDER BY a.nama_agen ASC
        `;
        const { rows } = await db.query(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getProperti,
    getPropertiBySlug,
    createProperti,
    updateProperti,
    updateStatusProperti,
    deleteProperti,
    getAgen
};