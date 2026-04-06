const express = require('express');
const router = express.Router();

const { getProperti, getPropertiById } = require('../controllers/properti_controller');
router.get('/properti', getProperti);
router.get('/properti/:id', getPropertiById);

module.exports = router;