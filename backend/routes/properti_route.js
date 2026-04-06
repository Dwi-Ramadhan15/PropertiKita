const express = require('express');
const router = express.Router();

const { getProperti } = require('../controllers/properti_controller');

router.get('/properti', getProperti);

module.exports = router;