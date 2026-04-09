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
 *         kamar_tidur:
 *           type: integer
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
 *               kamar_tidur:
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
router.post('/', upload.array('foto', 10), propertiController.createProperti);

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
 *               kamar_tidur:
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
router.put('/:id', upload.array('foto', 10), propertiController.updateProperti);

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

module.exports = router;