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
router.post('/properti', upload.array('images', 10), propertiController.createProperti);
router.put('/properti/:id', upload.array('images', 10), propertiController.updateProperti);
router.put('/properti/:id/status', propertiController.updateStatusProperti);
router.delete('/properti/:id', verifyToken, propertiController.deleteProperti);

module.exports = router;