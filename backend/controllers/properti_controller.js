const db = require('../utils/db');

const getProperti = async(req, res) => {
    try {
        // 1. Tangkap parameter query dari URL
        const { minHarga, maxHarga, lokasi } = req.query;

        // 2. Setup dasar SQL Query
        let query = 'SELECT * FROM properties WHERE 1=1';
        const queryParams = [];

        // 3. SQL Logic Dinamis & Data Sanitization (PostgreSQL)
        // Jika ada minHarga dan maxHarga, gunakan BETWEEN
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

        // Jika ada filter lokasi, gunakan ILIKE agar tidak case-sensitive
        if (lokasi) {
            queryParams.push(`%${lokasi}%`);
            query += ` AND lokasi ILIKE $${queryParams.length}`;
        }

        // Eksekusi query dengan parameter aman (Data Sanitization)
        const { rows } = await db.query(query, queryParams);

        // 4. GeoJSON Formatter & Spatial Data Handling
        const geoJSON = {
            type: "FeatureCollection",
            features: rows.map(row => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    // Wajib: [Longitude, Latitude] untuk format GeoJSON standar
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

        // Kirim response ke client
        res.status(200).json({
            success: true,
            data: geoJSON
        });

    } catch (error) {
        console.error('Error di getProperti:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data properti geospasial'
        });
    }
};

module.exports = { getProperti };