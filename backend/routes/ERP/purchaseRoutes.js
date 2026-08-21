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
const { requirePermission } = require('../../middleware/auth');
const P = require('../../constants/permissions').PURCHASE;

// ── Dashboard ──
router.get('/dashboard', purchaseController.getDashboardStats);

// ── Suppliers / Vendor Master ──
router.get('/suppliers/lookup/gstin/:gstin', supplierController.lookupByGSTIN);
router.get('/suppliers', supplierController.getSuppliers);
router.get('/suppliers/:id', supplierController.getSupplier);
router.post('/suppliers', requirePermission(P.SUPPLIER_MANAGE), supplierController.createSupplier);
router.put('/suppliers/:id', requirePermission(P.SUPPLIER_MANAGE), supplierController.updateSupplier);
router.delete('/suppliers/:id', requirePermission(P.SUPPLIER_MANAGE), supplierController.deleteSupplier);

// ── Purchase Requisitions (Indents) ──
router.get('/requisitions', requisitionController.getRequisitions);
router.get('/requisitions/:id', requisitionController.getRequisition);
router.get('/requisitions/:id/amendments', requisitionController.getAmendmentHistory);
router.post('/requisitions', requirePermission(P.REQUISITION_CREATE), requisitionController.createRequisition);
router.put('/requisitions/:id', requirePermission(P.REQUISITION_CREATE), requisitionController.updateRequisition);
router.put('/requisitions/:id/approve', requirePermission(P.REQUISITION_APPROVE), requisitionController.approveRequisition);
router.delete('/requisitions/:id', requirePermission(P.REQUISITION_DELETE), requisitionController.deleteRequisition);

// ── Purchase Orders ──
router.get('/orders/terms/:old_po_no', poController.getPOTermsByPoNo);
router.get('/orders', poController.getPurchaseOrders);
router.get('/orders/:id', poController.getPurchaseOrder);
router.post('/orders', requirePermission(P.ORDER_CREATE), poController.createPurchaseOrder);
router.put('/orders/:id', requirePermission(P.ORDER_CREATE), poController.updatePurchaseOrder);
router.put('/orders/:id/approve', requirePermission(P.ORDER_APPROVE), poController.approvePurchaseOrder);
router.put('/orders/:id/recalculate', requirePermission(P.ORDER_CREATE), poController.recalculatePO);
router.delete('/orders/:id', requirePermission(P.ORDER_DELETE), poController.deletePurchaseOrder);

// ── RFQ ──
router.get('/rfq', rfqController.getRFQs);
router.get('/rfq/:id', rfqController.getRFQ);
router.post('/rfq', requirePermission(P.ORDER_CREATE), rfqController.createRFQ);
router.put('/rfq/:id', requirePermission(P.ORDER_CREATE), rfqController.updateRFQ);
router.put('/rfq/:id/select-quote', requirePermission(P.ORDER_CREATE), rfqController.selectVendorQuote);
router.delete('/rfq/:id', requirePermission(P.ORDER_DELETE), rfqController.deleteRFQ);

// ── Price List ──
router.get('/price-list', priceListController.getPriceList);
router.post('/price-list', requirePermission(P.SUPPLIER_MANAGE), priceListController.createPrice);
router.put('/price-list/:id', requirePermission(P.SUPPLIER_MANAGE), priceListController.updatePrice);
router.delete('/price-list/:id', requirePermission(P.SUPPLIER_MANAGE), priceListController.deletePrice);

// ── Vendor Ratings ──
router.get('/vendor-ratings', vendorRatingController.getRatings);
router.get('/vendor-ratings/supplier/:id/summary', vendorRatingController.getSupplierSummary);
router.post('/vendor-ratings', requirePermission(P.SUPPLIER_MANAGE), vendorRatingController.createRating);
router.delete('/vendor-ratings/:id', requirePermission(P.SUPPLIER_MANAGE), vendorRatingController.deleteRating);

// ── PR Sanctions ──
router.get('/sanctions', prSanctionController.getSanctions);
router.post('/sanctions', requirePermission(P.REQUISITION_APPROVE), prSanctionController.createSanctions);

// ── Cost Centers ──
router.get('/cost-centers', costCenterController.getCostCenters);
router.post('/cost-centers', requirePermission(P.ORDER_CREATE), costCenterController.createCostCenter);

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
router.put('/settings', requirePermission(P.SUPPLIER_MANAGE), purchaseSettingsController.updateSettings);

// ── Purchase Returns / Debit Notes ──
router.get('/returns', purchaseReturnController.getPurchaseReturns);
router.get('/returns/next-number', purchaseReturnController.getNextReturnNumber);
router.get('/returns/returnable-items', purchaseReturnController.getReturnableItems);
router.get('/returns/pending-supplier', purchaseReturnController.getPendingReturnsForSupplier);
router.get('/returns/:id', purchaseReturnController.getPurchaseReturn);
router.post('/returns', requirePermission(P.RETURN_CREATE), purchaseReturnController.createPurchaseReturn);
router.put('/returns/:id', requirePermission(P.RETURN_CREATE), purchaseReturnController.updatePurchaseReturn);
router.put('/returns/:id/submit', requirePermission(P.RETURN_CREATE), purchaseReturnController.submitPurchaseReturn);
router.put('/returns/:id/approve', requirePermission(P.ORDER_APPROVE), purchaseReturnController.approvePurchaseReturn);
router.put('/returns/:id/reject', requirePermission(P.ORDER_APPROVE), purchaseReturnController.rejectPurchaseReturn);
router.put('/returns/:id/cancel', requirePermission(P.ORDER_APPROVE), purchaseReturnController.cancelPurchaseReturn);
router.delete('/returns/:id', requirePermission(P.ORDER_DELETE), purchaseReturnController.deletePurchaseReturn);

module.exports = router;
