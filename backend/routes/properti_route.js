const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const agenController = require('../controllers/agenController');
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middlewares/auth');

const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/properti', adminController.getProperti);
router.get('/properti/:slug', adminController.getPropertiBySlug);
router.put('/properti/:id/status', verifyToken, adminController.updateStatusProperti);
router.get('/agen', adminController.getAgen);

router.post('/properti', verifyToken, upload.array('images', 10), agenController.createProperti);
router.put('/properti/:id', verifyToken, upload.array('images', 10), agenController.updateProperti);
router.delete('/properti/:id', verifyToken, agenController.deleteProperti);

router.get('/fasilitas', verifyToken, agenController.getAllFasilitas);
router.post('/fasilitas', verifyToken, agenController.createFasilitas);
router.put('/fasilitas/:id', verifyToken, agenController.updateFasilitas);
router.delete('/fasilitas/:id', verifyToken, agenController.deleteFasilitas);

router.get('/notifications/:id_agen', verifyToken, agenController.getNotifikasiAgen);
router.put('/notifications/:id/read', verifyToken, agenController.tandaiNotifDibaca);
router.delete('/notifications/:id/clear', verifyToken, agenController.clearNotifications);

module.exports = router;