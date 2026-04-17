const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: "Akses ditolak!" });

    jwt.verify(token, process.env.JWT_SECRET || 'secretkey', (err, user) => {
        if (err) return res.status(403).json({ success: false, message: "Token tidak valid!" });
        req.user = user;
        next();
    });
};

router.post('/register', upload.single('image'), userController.register);
router.post('/login', userController.login);
router.post('/verify-otp', userController.verifyOtp);
router.get('/me', authenticateToken, userController.getProfile);
router.put('/update', authenticateToken, userController.updateProfile);
router.put('/update-avatar', authenticateToken, upload.single('image'), userController.updateAvatar);

module.exports = router;