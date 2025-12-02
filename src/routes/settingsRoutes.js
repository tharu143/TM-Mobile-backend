const express = require('express');
const router = express.Router();
const { getSettings, saveSettings, getPrintSettings, savePrintSettings, getEmailSettings, saveEmailSettings } = require('../controllers/settingsController');

router.get('/settings', getSettings);
router.post('/settings', saveSettings);
router.get('/print', getPrintSettings);
router.post('/print', savePrintSettings);
router.get('/email', getEmailSettings);
router.post('/email', saveEmailSettings);

module.exports = router;
