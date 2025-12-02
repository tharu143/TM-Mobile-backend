const express = require('express');
const router = express.Router();
const { getCustomers, addCustomer, updateCustomer, deleteCustomer, searchCustomers } = require('../controllers/customerController');

router.get('/customers', getCustomers);
router.post('/customers', addCustomer);
router.put('/customers/:id', updateCustomer);
router.delete('/customers/:id', deleteCustomer);
router.get('/customers/search', searchCustomers);

module.exports = router;
