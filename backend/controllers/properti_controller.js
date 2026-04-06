const db = require('../utils/db');

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

const getPropertiById = async(req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM properties WHERE id = $1';
        const { rows } = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Data properti tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error('Error di getPropertiById:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil data properti berdasarkan ID'
        });
    }
};

module.exports = { getProperti, getPropertiById };