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

const createProperti = async(req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const { title, harga, lokasi, tipe, latitude, longitude, id_kategori, kamar_tidur, kamar_mandi, luas, deskripsi, fasilitas } = req.body;
        const files = req.files;

        if (!title || !harga || !id_kategori) {
            return res.status(400).json({ success: false, message: "Judul, Harga, dan Kategori wajib diisi!" });
        }
        if (!files || files.length < 2) {
            return res.status(400).json({ success: false, message: "Minimal dua foto wajib diunggah!" });
        }

        const userId = req.user.id;
        const realAgenId = await getRealAgenId(userId, client);

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
                await client.query(`INSERT INTO fasilitas_properti (id_properti, id_agen, nama_fasilitas) VALUES ($1, $2, $3)`, [propertiId, realAgenId, f]);
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

        try {
            const userRes = await db.query("SELECT name, email FROM users WHERE id = $1", [userId]);
            const userName = userRes.rows[0].name;

            const adminRes = await db.query("SELECT id FROM users WHERE role = 'admin'");
            const msgAdmin = `Agen ${userName} menambahkan properti baru: "${title}". Menunggu verifikasi.`;

            for (const admin of adminRes.rows) {
                await db.query(
                    "INSERT INTO notifications (id_user, title, message, status, slug) VALUES ($1, $2, $3, $4, $5)", [admin.id, "Listing Baru", msgAdmin, "pending", slug]
                );
            }

            if (req.io) {
                req.io.to('admin_room').emit('notify_admin', {
                    title: "Listing Baru",
                    message: msgAdmin,
                    status: "pending",
                    slug: slug,
                    created_at: new Date()
                });
            }
        } catch (notifError) {
            console.error(notifError);
        }

        res.status(201).json({ success: true, message: "Properti berhasil dikirim dan menunggu tinjauan admin" });
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
        const { title, harga, lokasi, tipe, latitude, longitude, id_agen, id_kategori, kamar_tidur, kamar_mandi, luas, deskripsi, fasilitas, status, existing_images } = req.body;

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
                await client.query(`INSERT INTO fasilitas_properti (id_properti, id_agen, nama_fasilitas) VALUES ($1, $2, $3)`, [id, realAgenId, f]);
            }
        }

        let imagesToKeep = [];
        if (existing_images) {
            imagesToKeep = typeof existing_images === 'string' ? JSON.parse(existing_images) : existing_images;
        }

        if (imagesToKeep.length > 0) {
            await client.query("DELETE FROM property_images WHERE id_properti = $1 AND image_url != ALL($2::text[])", [id, imagesToKeep]);
        } else {
            await client.query("DELETE FROM property_images WHERE id_properti = $1", [id]);
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

        const finalImages = await client.query("SELECT image_url FROM property_images WHERE id_properti = $1 ORDER BY id DESC LIMIT 1", [id]);
        if (finalImages.rows.length > 0) {
            await client.query("UPDATE properties SET image_url = $1 WHERE id = $2", [finalImages.rows[0].image_url, id]);
        } else {
            await client.query("UPDATE properties SET image_url = NULL WHERE id = $2", [id]);
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

const getAllFasilitas = async(req, res) => {
    try {
        const userId = req.user ?.id || req.query.id_agen;
        const realAgenId = await getRealAgenId(userId);

        if (!realAgenId) {
            return res.status(401).json({ success: false, message: "Akses ditolak. ID Agen tidak valid." });
        }
        const query = `
      SELECT MAX(id) as id, nama_fasilitas 
      FROM fasilitas_properti 
      WHERE id_agen = $1 
      GROUP BY LOWER(nama_fasilitas), nama_fasilitas
      ORDER BY MAX(id) DESC
    `;

        const { rows } = await db.query(query, [realAgenId]);

        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createFasilitas = async(req, res) => {
    try {
        const userId = req.user ?.id;
        const realAgenId = await getRealAgenId(userId);
        const { nama_fasilitas } = req.body;

        if (!realAgenId) {
            return res.status(401).json({ success: false, message: "Akses ditolak! Silakan login." });
        }

        if (!nama_fasilitas) {
            return res.status(400).json({ success: false, message: "Nama fasilitas wajib diisi!" });
        }
        const result = await db.query(
            "INSERT INTO fasilitas_properti (id_agen, nama_fasilitas) VALUES ($1, $2) RETURNING *", [realAgenId, nama_fasilitas]
        );

        res.status(201).json({
            success: true,
            message: "Fasilitas berhasil ditambahkan",
            data: result.rows[0]
        });
    } catch (error) {
        res.status(400).json({ success: false, message: "Gagal menambahkan fasilitas: " + error.message });
    }
};

const updateFasilitas = async(req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ?.id;
        const realAgenId = await getRealAgenId(userId);
        const { nama_fasilitas } = req.body;

        const fas = await db.query("SELECT nama_fasilitas FROM fasilitas_properti WHERE id = $1", [id]);
        if (fas.rows.length === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

        const oldName = fas.rows[0].nama_fasilitas;

        const result = await db.query(
            "UPDATE fasilitas_properti SET nama_fasilitas = $1 WHERE id_agen = $2 AND LOWER(nama_fasilitas) = LOWER($3) RETURNING *", [nama_fasilitas, realAgenId, oldName]
        );

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(400).json({ success: false, message: "Gagal update fasilitas" });
    }
};

const deleteFasilitas = async(req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user ?.id;
        const realAgenId = await getRealAgenId(userId);

        const fas = await db.query("SELECT nama_fasilitas FROM fasilitas_properti WHERE id = $1", [id]);
        if (fas.rows.length === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan" });

        const oldName = fas.rows[0].nama_fasilitas;

        await db.query(
            "DELETE FROM fasilitas_properti WHERE id_agen = $1 AND LOWER(nama_fasilitas) = LOWER($2)", [realAgenId, oldName]
        );

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getNotifikasiAgen = async(req, res) => {
    try {
        const { id_agen } = req.params;
        const userCheck = await db.query("SELECT role FROM users WHERE id = $1", [id_agen]);

        if (userCheck.rows.length > 0 && userCheck.rows[0].role !== 'admin') {
            const realAgenId = await getRealAgenId(id_agen);
            if (!realAgenId) {
                return res.status(200).json({ success: true, data: [] });
            }
            const query = "SELECT * FROM notifications WHERE id_agen = $1 ORDER BY id DESC";
            const { rows } = await db.query(query, [realAgenId]);
            return res.status(200).json({ success: true, data: rows });
        } else {
            const query = "SELECT * FROM notifications WHERE id_user = $1 ORDER BY id DESC";
            const { rows } = await db.query(query, [id_agen]);
            return res.status(200).json({ success: true, data: rows });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const tandaiNotifDibaca = async(req, res) => {
    try {
        const { id } = req.params;
        const userCheck = await db.query("SELECT role FROM users WHERE id = $1", [id]);

        let query = "";
        let paramId = id;

        if (userCheck.rows.length > 0 && userCheck.rows[0].role !== 'admin') {
            const realAgenId = await getRealAgenId(id);
            if (realAgenId) paramId = realAgenId;
            query = "UPDATE notifications SET is_read = true WHERE id_agen = $1 RETURNING *";
        } else {
            query = "UPDATE notifications SET is_read = true WHERE id_user = $1 RETURNING *";
        }

        await db.query(query, [paramId]);

        res.status(200).json({ success: true, message: "Semua notifikasi ditandai telah dibaca" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const clearNotifications = async(req, res) => {
    try {
        const { id } = req.params;
        const userCheck = await db.query("SELECT role FROM users WHERE id = $1", [id]);

        let query = "";
        let paramId = id;

        if (userCheck.rows.length > 0 && userCheck.rows[0].role !== 'admin') {
            const realAgenId = await getRealAgenId(id);
            if (realAgenId) paramId = realAgenId;
            query = "DELETE FROM notifications WHERE id_agen = $1";
        } else {
            query = "DELETE FROM notifications WHERE id_user = $1";
        }

        await db.query(query, [paramId]);
        res.status(200).json({ success: true, message: "Notifikasi dibersihkan" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createProperti,
    updateProperti,
    deleteProperti,
    getAllFasilitas,
    createFasilitas,
    updateFasilitas,
    deleteFasilitas,
    getNotifikasiAgen,
    tandaiNotifDibaca,
    clearNotifications
};