const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // Memory storage
const { getProducts, addProduct, updateProduct, deleteProduct, getMobiles, addMobile, getAccessories, addAccessory } = require('../controllers/productController');

router.get('/products', getProducts);
router.post('/products', upload.single('image'), addProduct);
router.put('/products/:id', upload.single('image'), updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/mobiles', getMobiles);
router.post('/mobiles', addMobile);

router.get('/accessories', getAccessories);
router.post('/accessories', addAccessory);

module.exports = router;
