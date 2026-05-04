const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { getAllUsers } = require('../controllers/user_controller');
const refreshTokenController = require('../controllers/user_controller');;

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

router.post('/register', upload.single('foto_profil'), userController.register);
router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshTokenEndpoint);
router.post('/verify-otp', userController.verifyOtp);

router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

router.get('/', getAllUsers);

router.get('/profile', authenticateToken, userController.getProfile);
router.get('/:id/profile', userController.getUserProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.post('/avatar', authenticateToken, upload.single('avatar'), userController.updateAvatar);

router.get('/users/profile', authenticateToken, userController.getProfile);
router.get('/users/:id/profile', userController.getUserProfile);
router.put('/users/profile', authenticateToken, userController.updateProfile);
router.post('/users/avatar', authenticateToken, upload.single('avatar'), userController.updateAvatar);

module.exports = router;