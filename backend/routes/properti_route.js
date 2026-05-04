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
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/properti', propertiController.getProperti);
router.get('/agen', propertiController.getAgen);
router.get('/properti/:slug', propertiController.getPropertiBySlug);

router.post('/properti', verifyToken, upload.array('images', 10), propertiController.createProperti);
router.put('/properti/:id/status', verifyToken, propertiController.updateStatusProperti);
router.delete('/properti/:id', verifyToken, propertiController.deleteProperti);

router.get('/notifications/:id_agen', verifyToken, propertiController.getNotifikasiAgen);
router.put('/notifications/:id/read', verifyToken, propertiController.tandaiNotifDibaca);

router.get('/fasilitas', propertiController.getAllFasilitas);
router.post('/fasilitas', verifyToken, propertiController.createFasilitas);
router.put('/fasilitas/:id', verifyToken, propertiController.updateFasilitas);
router.delete('/fasilitas/:id', verifyToken, propertiController.deleteFasilitas);

module.exports = router;