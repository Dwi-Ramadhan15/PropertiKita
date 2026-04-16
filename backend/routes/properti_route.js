const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const propertiController = require('../controllers/properti_controller');
const { verifyToken } = require('../middlewares/auth');

const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) =>
        cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * @swagger
 * /api/properti:
 *   get:
 *     summary: Mengambil data properti dinamis (Format GeoJSON + Pagination)
 *     tags: [Properti]
 *     parameters:
 *       - name: minHarga
 *         in: query
 *         schema:
 *           type: integer
 *       - name: maxHarga
 *         in: query
 *         schema:
 *           type: integer
 *       - name: lokasi
 *         in: query
 *         schema:
 *           type: string
 *       - name: tipe
 *         in: query
 *         schema:
 *           type: string
 *       - name: id_kategori
 *         in: query
 *         description: "Filter berdasarkan kategori (1 = Dijual, 2 = Disewakan)"
 *         schema:
 *           type: integer
 *       - name: kamar_tidur
 *         in: query
 *         schema:
 *           type: integer
 *       - name: page
 *         in: query
 *         description: Halaman ke berapa
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Jumlah data per halaman
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Data properti berhasil diambil
 */
router.get('/properti', propertiController.getProperti);

/**
 * @swagger
 * /api/agen:
 *   get:
 *     summary: Mendapatkan daftar semua agen
 *     tags: [Agen]
 *     responses:
 *       200:
 *         description: Daftar agen berhasil diambil
 */
router.get('/agen', propertiController.getAgen);

/**
 * @swagger
 * /api/properti/{slug}:
 *   get:
 *     summary: Mendapatkan detail properti berdasarkan slug
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail properti berhasil diambil
 *       404:
 *         description: Properti tidak ditemukan
 */
router.get('/properti/:slug', propertiController.getPropertiBySlug);

/**
 * @swagger
 * /api/properti:
 *   post:
 *     summary: Menambahkan properti baru
 *     tags: [Properti]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               title:
 *                 type: string
 *               harga:
 *                 type: integer
 *               lokasi:
 *                 type: string
 *               tipe:
 *                 type: string
 *               id_kategori:
 *                 type: integer
 *                 description: "ID Kategori (1: Dijual, 2: Disewakan)"
 *               kamar_tidur:
 *                 type: integer
 *               kamar_mandi:
 *                 type: integer
 *               luas:
 *                 type: integer
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               id_agen:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Properti berhasil dibuat
 */
router.post(
    '/properti',
    upload.array('images', 10),
    propertiController.createProperti
);

/**
 * @swagger
 * /api/properti/{id}:
 *   put:
 *     summary: Mengupdate data properti
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               title:
 *                 type: string
 *               harga:
 *                 type: integer
 *               lokasi:
 *                 type: string
 *               tipe:
 *                 type: string
 *               id_kategori:
 *                 type: integer
 *                 description: "ID Kategori (1: Dijual, 2: Disewakan)"
 *               kamar_tidur:
 *                 type: integer
 *               kamar_mandi:
 *                 type: integer
 *               luas:
 *                 type: integer
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               id_agen:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Data berhasil diperbarui
 */
router.put(
    '/properti/:id',
    upload.array('images', 10),
    propertiController.updateProperti
);

/**
 * @swagger
 * /api/properti/{id}:
 *   delete:
 *     summary: Menghapus data properti
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Data berhasil dihapus
 */
router.delete('/properti/:id', verifyToken, propertiController.deleteProperti);

module.exports = router;