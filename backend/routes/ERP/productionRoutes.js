const express = require('express');
const router = express.Router();
const productionOrderController = require('../../controllers/ERP/productionOrderController');

router.get('/orders', productionOrderController.getList);
router.get('/orders/:id', productionOrderController.getOne);
router.post('/orders', productionOrderController.create);
router.put('/orders/:id/status', productionOrderController.updateStatus);
router.post('/orders/:id/issue-material', productionOrderController.issueMaterial);
router.delete('/orders/:id', productionOrderController.delete);

module.exports = router;
