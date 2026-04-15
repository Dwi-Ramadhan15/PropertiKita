const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');
const multer = require('multer');

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/register', upload.single('image'), userController.register);
router.post('/login', userController.login);
router.post('/verify-otp', userController.verifyOtp);

module.exports = router;