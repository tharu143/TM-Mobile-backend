const express = require('express');
const router = express.Router();
const { getSales, createSale } = require('../controllers/salesController');

router.get('/sales', getSales);
router.post('/sales', createSale);

module.exports = router;
