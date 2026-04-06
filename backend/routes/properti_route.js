const express = require('express');
const router = express.Router();
const propertiController = require('../controllers/properti_controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads ada
const uploadPath = 'uploads/';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

// --- Konfigurasi Penyimpanan Foto (Multer) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// --- Dokumentasi Swagger & Endpoints ---

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
 *         judul:
 *           type: string
 *         deskripsi:
 *           type: string
 *         harga:
 *           type: integer
 *         lokasi:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 *         foto_path:
 *           type: string
 *         nama_agen:
 *           type: string
 *         no_whatsapp:
 *           type: string
 */

/**
 * @swagger
 * /api/properti/{id}:
 *   get:
 *     summary: Mendapatkan detail lengkap satu properti (Termasuk data Agen)
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Properti
 *     responses:
 *       200:
 *         description: Detail properti berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Properti'
 *       404:
 *         description: Properti tidak ditemukan
 */
router.get('/:id', propertiController.getPropertiDetail);

/**
 * @swagger
 * /api/properti:
 *   post:
 *     summary: Menambahkan properti baru ke sistem
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
 *               id_agen:
 *                 type: integer
 *               judul:
 *                 type: string
 *               deskripsi:
 *                 type: string
 *               harga:
 *                 type: integer
 *               lokasi:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Properti berhasil dibuat
 *       500:
 *         description: Server error
 */
router.post('/', upload.single('foto'), propertiController.createProperti);

/**
 * @swagger
 * /api/properti/{id}:
 *   delete:
 *     summary: Menghapus data properti dan file foto fisiknya dari server
 *     tags: [Properti]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Properti yang akan dihapus
 *     responses:
 *       200:
 *         description: Data dan file foto berhasil dihapus
 *       404:
 *         description: Data tidak ditemukan
 */
router.delete('/:id', propertiController.deleteProperti);

module.exports = router;