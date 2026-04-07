const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const propertiController = require('../controllers/properti_controller');

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
 * components:
 *   schemas:
 *     Properti:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         id_agen:
 *           type: integer
 *         title:
 *           type: string
 *         harga:
 *           type: integer
 *         lokasi:
 *           type: string
 *         tipe:
 *           type: string
 *         image_url:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 */

/**
 * @swagger
 * /api/properti:
 *   get:
 *     summary: Pencarian properti dinamis (Format GeoJSON)
 *     description: Mengambil data properti berdasarkan filter harga, lokasi, dan kamar tidur, diubah menjadi format GeoJSON untuk Leaflet.js.
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
 *       - in: query
 *         name: kamarTidur
 *         schema:
 *           type: integer
 *         description: Minimal jumlah kamar tidur (contoh 3)
 *     responses:
 *       200:
 *         description: Data properti berhasil diambil
 */
router.get('/properti', propertiController.getProperti);

/**
 * @swagger
 * /api/properti/{id}:
 *   get:
 *     summary: Mendapatkan detail lengkap satu properti
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detail properti berhasil diambil
 *       404:
 *         description: Properti tidak ditemukan
 */
router.get('/properti/:id', propertiController.getPropertiById);

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
 *               foto:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               harga:
 *                 type: integer
 *               lokasi:
 *                 type: string
 *               tipe:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               id_agen:
 *                 type: integer
 *               kamar_tidur:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Properti berhasil dibuat
 */
router.post(
    '/properti',
    upload.single('foto'),
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
 *               foto:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *               harga:
 *                 type: integer
 *               lokasi:
 *                 type: string
 *               tipe:
 *                 type: string
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
    upload.single('foto'),
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
router.delete('/properti/:id', propertiController.deleteProperti);

module.exports = router;