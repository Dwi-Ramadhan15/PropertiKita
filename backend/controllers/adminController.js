const db = require('../utils/db');

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
        let imagesMap = {};

        if (propertyIds.length > 0) {
            const fasRes = await db.query(
                "SELECT id_properti, nama_fasilitas FROM fasilitas_properti WHERE id_properti = ANY($1)", [propertyIds]
            );
            fasRes.rows.forEach(f => {
                if (!fasilitasMap[f.id_properti]) fasilitasMap[f.id_properti] = [];
                fasilitasMap[f.id_properti].push(f.nama_fasilitas);
            });

            const imgRes = await db.query(
                "SELECT id_properti, image_url FROM property_images WHERE id_properti = ANY($1)", [propertyIds]
            );
            imgRes.rows.forEach(img => {
                if (!imagesMap[img.id_properti]) imagesMap[img.id_properti] = [];
                imagesMap[img.id_properti].push(img.image_url);
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
                    fasilitas: fasilitasMap[row.id] || [],
                    images: imagesMap[row.id] || []
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

const updateStatusProperti = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected', 'pending', 'sold'].includes(status)) {
            return res.status(400).json({ success: false, message: "Status tidak valid" });
        }

        const query = "UPDATE properties SET status = $1 WHERE id = $2 RETURNING title, id_agen";
        const result = await db.query(query, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
        }

        const properti = result.rows[0];
        let msg = "";
        let notifTitle = "Update Status Listing";
        if (status === 'approved') {
            msg = `Listing "${properti.title}" telah DISETUJUI oleh admin.`;
        } else if (status === 'rejected') {
            msg = `Listing "${properti.title}" DITOLAK oleh admin.`;
        } else if (status === 'sold') {
            msg = `Status "${properti.title}" kini: TERJUAL.`;
        }

        if (msg !== "") {
            try {
                await db.query(
                    "INSERT INTO notifications (id_agen, title, message, status) VALUES ($1, $2, $3, $4)", [properti.id_agen, notifTitle, msg, status]
                );

                const adminRes = await db.query("SELECT id FROM users WHERE role = 'admin'");
                const msgAdminLog = `Anda merubah status "${properti.title}" menjadi ${status.toUpperCase()}.`;
                for (const admin of adminRes.rows) {
                    await db.query(
                        "INSERT INTO notifications (id_user, title, message, status) VALUES ($1, $2, $3, $4)", [admin.id, "Riwayat Aktivitas", msgAdminLog, status]
                    );
                }
            } catch (err) {}
        }

        if (req.io && msg !== "") {
            const payload = {
                title: notifTitle,
                status: status,
                message: msg,
                created_at: new Date()
            };

            req.io.to(`agen_${properti.id_agen}`).emit('notify_agen', payload);

            const agenEmailRes = await db.query("SELECT email FROM agen WHERE id = $1", [properti.id_agen]);
            if (agenEmailRes.rows.length > 0) {
                const uRes = await db.query("SELECT id FROM users WHERE email = $1", [agenEmailRes.rows[0].email]);
                if (uRes.rows.length > 0) {
                    req.io.to(`agen_${uRes.rows[0].id}`).emit('notify_agen', payload);
                }
            }
        }

        res.status(200).json({ success: true, message: `Status berhasil diubah menjadi ${status}`, data: properti });
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
            ORDER BY a.nama_agen DESC
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
    updateStatusProperti,
    getAgen
};