const express = require('express');
const router = express.Router();
const { getStats, getRecentSales, getLowStock } = require('../controllers/dashboardController');

router.get('/dashboard/stats', getStats);
router.get('/dashboard/recent-sales', getRecentSales);
router.get('/dashboard/low-stock', getLowStock);

module.exports = router;
