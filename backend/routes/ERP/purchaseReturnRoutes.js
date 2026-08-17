const express = require('express');
const router = express.Router();
const purchaseReturnController = require('../../controllers/ERP/purchaseReturnController');

router.get('/', purchaseReturnController.getPurchaseReturns);
router.get('/next-number', purchaseReturnController.getNextReturnNumber);
router.get('/returnable-items', purchaseReturnController.getReturnableItems);
router.get('/pending-supplier', purchaseReturnController.getPendingReturnsForSupplier);
router.get('/:id', purchaseReturnController.getPurchaseReturn);
router.post('/', purchaseReturnController.createPurchaseReturn);
router.put('/:id', purchaseReturnController.updatePurchaseReturn);
router.put('/:id/submit', purchaseReturnController.submitPurchaseReturn);
router.put('/:id/approve', purchaseReturnController.approvePurchaseReturn);
router.put('/:id/reject', purchaseReturnController.rejectPurchaseReturn);
router.put('/:id/cancel', purchaseReturnController.cancelPurchaseReturn);
router.delete('/:id', purchaseReturnController.deletePurchaseReturn);

module.exports = router;