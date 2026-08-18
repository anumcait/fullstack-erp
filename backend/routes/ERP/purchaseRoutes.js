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
const costCenterController = require('../../controllers/ERP/costCenterController');

// ── Dashboard ──
router.get('/dashboard', purchaseController.getDashboardStats);

// ── Suppliers / Vendor Master ──
router.get('/suppliers/lookup/gstin/:gstin', supplierController.lookupByGSTIN);
router.get('/suppliers', supplierController.getSuppliers);
router.get('/suppliers/:id', supplierController.getSupplier);
router.post('/suppliers', supplierController.createSupplier);
router.put('/suppliers/:id', supplierController.updateSupplier);
router.delete('/suppliers/:id', supplierController.deleteSupplier);

// ── Purchase Requisitions (Indents) ──
router.get('/requisitions', requisitionController.getRequisitions);
router.get('/requisitions/:id', requisitionController.getRequisition);
router.get('/requisitions/:id/amendments', requisitionController.getAmendmentHistory);
router.post('/requisitions', requisitionController.createRequisition);
router.put('/requisitions/:id', requisitionController.updateRequisition);
router.put('/requisitions/:id/approve', requisitionController.approveRequisition);
router.delete('/requisitions/:id', requisitionController.deleteRequisition);

// ── Purchase Orders ──
router.get('/orders/terms/:old_po_no', poController.getPOTermsByPoNo);
router.get('/orders', poController.getPurchaseOrders);
router.get('/orders/:id', poController.getPurchaseOrder);
router.post('/orders', poController.createPurchaseOrder);
router.put('/orders/:id', poController.updatePurchaseOrder);
router.put('/orders/:id/approve', poController.approvePurchaseOrder);
router.put('/orders/:id/recalculate', poController.recalculatePO);
router.delete('/orders/:id', poController.deletePurchaseOrder);

// ── RFQ ──
router.get('/rfq', rfqController.getRFQs);
router.get('/rfq/:id', rfqController.getRFQ);
router.post('/rfq', rfqController.createRFQ);
router.put('/rfq/:id', rfqController.updateRFQ);
router.put('/rfq/:id/select-quote', rfqController.selectVendorQuote);
router.delete('/rfq/:id', rfqController.deleteRFQ);

// ── Price List ──
router.get('/price-list', priceListController.getPriceList);
router.post('/price-list', priceListController.createPrice);
router.put('/price-list/:id', priceListController.updatePrice);
router.delete('/price-list/:id', priceListController.deletePrice);

// ── Vendor Ratings ──
router.get('/vendor-ratings', vendorRatingController.getRatings);
router.get('/vendor-ratings/supplier/:id/summary', vendorRatingController.getSupplierSummary);
router.post('/vendor-ratings', vendorRatingController.createRating);
router.delete('/vendor-ratings/:id', vendorRatingController.deleteRating);

// ── PR Sanctions ──
router.get('/sanctions', prSanctionController.getSanctions);
router.post('/sanctions', prSanctionController.createSanctions);

// ── Cost Centers ──
router.get('/cost-centers', costCenterController.getCostCenters);
router.post('/cost-centers', costCenterController.createCostCenter);

// ── Approvals Inbox ──
router.get('/approvals', approvalController.getPendingApprovals);
router.get('/stores-approvals', approvalController.getStoresApprovals);

// ── Recent Activity ──
router.get('/recent-activity', purchaseReportController.getRecentActivity);

// ── Reports ──
const R = purchaseReportController;
router.get('/reports/register', R.getPurchaseRegister);
router.get('/reports/vendor-spend', R.getVendorSpend);
router.get('/reports/grn-summary', R.getGrnSummary);
router.get('/reports/monthly-trend', R.getMonthlyTrend);
router.get('/reports/raw-material-inspection', R.getRawMaterialInspection);
router.get('/reports/supplier-summary', R.getSupplierSummary);
router.get('/reports/raw-material-purchase', R.getRawMaterialPurchase);
router.get('/reports/item-information', R.getItemInformation);
router.get('/reports/party-master', R.getPartyMaster);
router.get('/reports/supplier-rating', R.getSupplierRatingReport);
router.get('/reports/po-matrix', R.getPOMatrix);
router.get('/reports/po-matrix-detail', R.getPOMatrixDetail);
router.get('/reports/po-matrix-month', R.getPOMatrixMonth);
router.get('/reports/po-matrix-year', R.getPOMatrixYear);
router.get('/reports/pr-amendment', R.getPRAmendmentDetails);
router.get('/reports/pending-prs', R.getPendingPRs);
router.get('/reports/pending-pos', R.getPendingPOs);
router.get('/reports/received-material', R.getReceivedMaterial);
router.get('/reports/overdue-pr-items', R.getOverduePRItems);
router.get('/reports/delayed-pos', R.getDelayedPOs);
router.get('/reports/delayed-jos', R.getDelayedJOs);
router.get('/reports/overdue-items', R.getOverdueItems);
router.get('/reports/daily', R.getDailyReport);
router.get('/reports/pending-by-party', R.getPendingMaterialByParty);

// ── Purchase Settings ──
router.get('/settings', purchaseSettingsController.getSettings);
router.put('/settings', purchaseSettingsController.updateSettings);

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

module.exports = router;
