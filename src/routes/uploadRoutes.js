const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { uploadImages, serveImage, exportMobiles, importProducts } = require('../controllers/uploadController');

router.post('/upload/images', upload.array('images'), uploadImages);
router.post('/import/products', upload.single('file'), importProducts);
router.get('/images/:id', serveImage);
router.get('/export/mobiles', exportMobiles);

module.exports = router;
