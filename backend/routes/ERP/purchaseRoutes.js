const express = require('express');
const router = express.Router();
const purchaseController = require('../../controllers/ERP/purchaseController');

router.get('/', purchaseController.getPurchaseOrders);

module.exports = router;
