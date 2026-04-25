const express = require('express');
const router = express.Router();
const invoiceController = require('../../controllers/Accounts/invoiceController');

router.get('/', invoiceController.getInvoices);

module.exports = router;
