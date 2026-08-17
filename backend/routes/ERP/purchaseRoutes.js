const express = require('express');
const router = express.Router();
const purchaseController = require('../../controllers/ERP/purchaseController');
const supplierController = require('../../controllers/ERP/supplierController');
const requisitionController = require('../../controllers/ERP/requisitionController');
const poController = require('../../controllers/ERP/poController');
const rfqController = require('../../controllers/ERP/rfqController');
const priceListController = require('../../controllers/ERP/priceListController');
const vendorRatingController = require('../../controllers/ERP/vendorRatingController');
const purchaseSettingsController = require('../../controllers/ERP/purchaseSettingsController');
const purchaseReportController = require('../../controllers/ERP/purchaseReportController');
const approvalController = require('../../controllers/ERP/approvalController');
const prSanctionController = require('../../controllers/ERP/prSanctionController');
const purchaseReturnController = require('../../controllers/ERP/purchaseReturnController');

// ── Purchase Returns / Debit Notes ──
router.get('/returns', purchaseReturnController.getPurchaseReturns);
router.get('/returns/next-number', purchaseReturnController.getNextReturnNumber);
router.get('/returns/returnable-items', purchaseReturnController.getReturnableItems);
router.get('/returns/pending-supplier', purchaseReturnController.getPendingReturnsForSupplier);
router.get('/returns/:id', purchaseReturnController.getPurchaseReturn);
router.post('/returns', purchaseReturnController.createPurchaseReturn);
router.put('/returns/:id', purchaseReturnController.updatePurchaseReturn);
router.put('/returns/:id/submit', purchaseReturnController.submitPurchaseReturn);
router.put('/returns/:id/approve', purchaseReturnController.approvePurchaseReturn);
router.put('/returns/:id/reject', purchaseReturnController.rejectPurchaseReturn);
router.put('/returns/:id/cancel', purchaseReturnController.cancelPurchaseReturn);
router.delete('/returns/:id', purchaseReturnController.deletePurchaseReturn);

// ── Cost Centers ──
const costCenterController = require('../../controllers/ERP/costCenterController');
router.get('/cost-centers', costCenterController.getCostCenters);
router.post('/cost-centers', costCenterController.createCostCenter);

// ── Purchase Settings ──
router.get('/settings', purchaseSettingsController.getSettings);
router.put('/settings', purchaseSettingsController.updateSettings);

module.exports = router;
