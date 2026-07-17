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

// ── Dashboard ──
router.get('/dashboard', purchaseController.getDashboardStats);
router.get('/recent-activity', purchaseReportController.getRecentActivity);

// ── Unified Approvals Inbox (cross-module) ──
router.get('/approvals', approvalController.getPendingApprovals);

// ── Reports ──
router.get('/reports/register', purchaseReportController.getPurchaseRegister);
router.get('/reports/vendor-spend', purchaseReportController.getVendorSpend);
router.get('/reports/monthly-trend', purchaseReportController.getMonthlyTrend);
router.get('/reports/grn-summary', purchaseReportController.getGrnSummary);
router.get('/reports/pending-prs', purchaseReportController.getPendingPRs);
router.get('/reports/pending-pos', purchaseReportController.getPendingPOs);
router.get('/reports/received-material', purchaseReportController.getReceivedMaterial);
router.get('/reports/pr-details', purchaseReportController.getPRDetails);
router.get('/reports/raw-material-inspection', purchaseReportController.getRawMaterialInspection);
router.get('/reports/supplier-summary', purchaseReportController.getSupplierSummary);
router.get('/reports/raw-material-purchase', purchaseReportController.getRawMaterialPurchase);
router.get('/reports/item-information', purchaseReportController.getItemInformation);
router.get('/reports/party-master', purchaseReportController.getPartyMaster);
router.get('/reports/supplier-rating', purchaseReportController.getSupplierRatingReport);
router.get('/reports/daily', purchaseReportController.getDailyReport);
router.get('/reports/pending-by-party', purchaseReportController.getPendingMaterialByParty);
router.get('/reports/pr-amendment', purchaseReportController.getPRAmendmentDetails);

// ── Purchase Orders ──
router.get('/orders', poController.getPurchaseOrders);
router.get('/orders/:id', poController.getPurchaseOrder);
router.post('/orders', poController.createPurchaseOrder);
router.put('/orders/:id', poController.updatePurchaseOrder);
router.put('/orders/:id/approve', poController.approvePurchaseOrder);
router.delete('/orders/:id', poController.deletePurchaseOrder);

// ── Purchase Requisitions (Indents) ──
router.get('/requisitions', requisitionController.getRequisitions);
router.get('/requisitions/:id', requisitionController.getRequisition);
router.get('/requisitions/:id/amendments', requisitionController.getAmendmentHistory);
router.post('/requisitions', requisitionController.createRequisition);
router.put('/requisitions/:id', requisitionController.updateRequisition);
router.put('/requisitions/:id/approve', requisitionController.approveRequisition);
router.delete('/requisitions/:id', requisitionController.deleteRequisition);

// ── RFQ / Enquiry ──
router.get('/rfq', rfqController.getRFQs);
router.get('/rfq/:id', rfqController.getRFQ);
router.post('/rfq', rfqController.createRFQ);
router.put('/rfq/:id', rfqController.updateRFQ);
router.delete('/rfq/:id', rfqController.deleteRFQ);
router.put('/rfq/:id/select-vendor/:vendorId', rfqController.selectVendorQuote);

// ── Supplier / Vendor Master ──
router.get('/suppliers', supplierController.getSuppliers);
router.get('/suppliers/lookup/gstin/:gstin', supplierController.lookupByGSTIN);
router.get('/suppliers/:id', supplierController.getSupplier);
router.post('/suppliers', supplierController.createSupplier);
router.put('/suppliers/:id', supplierController.updateSupplier);
router.delete('/suppliers/:id', supplierController.deleteSupplier);

// ── Vendor Price List ──
router.get('/price-list', priceListController.getPriceList);
router.post('/price-list', priceListController.createPrice);
router.put('/price-list/:id', priceListController.updatePrice);
router.delete('/price-list/:id', priceListController.deletePrice);

// ── Vendor Rating ──
router.get('/vendor-ratings', vendorRatingController.getRatings);
router.post('/vendor-ratings', vendorRatingController.createRating);
router.delete('/vendor-ratings/:id', vendorRatingController.deleteRating);
router.get('/vendor-ratings/supplier/:id/summary', vendorRatingController.getSupplierSummary);

// ── Cost Centers ──
const costCenterController = require('../../controllers/ERP/costCenterController');
router.get('/cost-centers', costCenterController.getCostCenters);
router.post('/cost-centers', costCenterController.createCostCenter);

// ── Purchase Settings ──
router.get('/settings', purchaseSettingsController.getSettings);
router.put('/settings', purchaseSettingsController.updateSettings);

module.exports = router;
