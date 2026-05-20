const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/auth');
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/register', upload.single('foto_profil'), userController.register);
router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshTokenEndpoint);
router.post('/verify-otp', userController.verifyOtp);

router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

router.get('/users', verifyToken, userController.getAllUsers);
router.get('/users/:id', userController.getUserProfile);
router.delete('/users/:id', verifyToken, userController.deleteUser);

router.get('/agen/terverifikasi', userController.getVerifiedAgen);

router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, userController.updateProfile);
router.put('/change-password', verifyToken, userController.changePassword);
router.put('/avatar', verifyToken, upload.single('foto_profil'), userController.updateAvatar);

module.exports = router;