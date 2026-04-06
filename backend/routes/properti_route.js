const express = require('express');
const router = express.Router();
const propertiController = require('../controllers/properti_controller');

// Endpoint GET detail satu properti berdasarkan ID
router.get('/:id', propertiController.getPropertiDetail);

// Endpoint POST tambah properti (Nanti kita tambahkan middleware upload di sini)
router.post('/', propertiController.createProperti);

// Endpoint DELETE properti
router.delete('/:id', propertiController.deleteProperti);

module.exports = router;