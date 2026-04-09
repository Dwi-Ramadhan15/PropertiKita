const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');

// Fokus ke login, register, dan verify
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/verify-otp', userController.verifyOtp);


module.exports = router;