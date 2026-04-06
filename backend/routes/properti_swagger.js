/**
 * @swagger
 * /api/properti:
 *   get:
 *     summary: Pencarian properti dinamis (Format GeoJSON)
 *     description: Mengambil data properti berdasarkan filter harga dan lokasi, diubah menjadi format GeoJSON untuk Leaflet.js.
 *     tags: [Properti]
 *     parameters:
 *       - in: query
 *         name: minHarga
 *         schema:
 *           type: integer
 *         description: Harga minimal (contoh 1000000)
 *       - in: query
 *         name: maxHarga
 *         schema:
 *           type: integer
 *         description: Harga maksimal (contoh 500000000)
 *       - in: query
 *         name: lokasi
 *         schema:
 *           type: string
 *         description: Kata kunci lokasi (contoh "Rajabasa")
 *     responses:
 *       200:
 *         description: Data properti berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Objek berformat GeoJSON (FeatureCollection)
 *       500:
 *         description: Internal Server Error
 */