const express = require('express');
const router = express.Router();
const storesController = require('../../controllers/ERP/storesController');
const itemController = require('../../controllers/ERP/itemController');
const grnController = require('../../controllers/ERP/grnController');
const materialRequisitionController = require('../../controllers/ERP/materialRequisitionController');
const materialIssueController = require('../../controllers/ERP/materialIssueController');
const stockLedgerController = require('../../controllers/ERP/stockLedgerController');
const stockReportController = require('../../controllers/ERP/stockReportController');
const stockAuditController = require('../../controllers/ERP/stockAuditController');
const gateEntryController = require('../../controllers/ERP/gateEntryController');
const materialReturnController = require('../../controllers/ERP/materialReturnController');
const deliveryChallanController = require('../../controllers/ERP/deliveryChallanController');
const billingController = require('../../controllers/ERP/billingController');
const storesSettingsController = require('../../controllers/ERP/storesSettingsController');
const storesReportController = require('../../controllers/ERP/storesReportController');
const grrReportController = require('../../controllers/ERP/grrReportController');
const approvalController = require('../../controllers/ERP/approvalController');

// ── Dashboard ──
router.get('/dashboard', storesController.getDashboardStats);

// ── Approvals Inbox ──
router.get('/approvals', approvalController.getStoresApprovals);

// ── Reports ──
router.get('/reports/valuation', storesReportController.getInventoryValuation);
router.get('/reports/low-stock', storesReportController.getLowStock);
router.get('/reports/stock-movement', storesReportController.getStockMovement);
router.get('/reports/abc', storesReportController.getAbcSummary);

// ── Stock ──
router.get('/stock', storesController.getStock);
router.get('/material-requisitions/:id/stock-check', storesController.checkStockForMR);

// ── Item Group / Sub Group / Type / Sub Type (4-level classification) ──
router.get('/groups', itemController.getGroups);
router.post('/groups', itemController.createGroup);
router.put('/groups/:id', itemController.updateGroup);
router.delete('/groups/:id', itemController.deleteGroup);

// Alias used by the Item Master (AddItem) UI for the "Item Group" lookup/create.
// Frontend refers to the item group as "category" — keep both endpoints in sync.
router.get('/categories', itemController.getGroups);
router.post('/categories', itemController.createGroup);

router.get('/subgroups', itemController.getSubGroups);
router.post('/subgroups', itemController.createSubGroup);
router.put('/subgroups/:id', itemController.updateSubGroup);
router.delete('/subgroups/:id', itemController.deleteSubGroup);

router.get('/item-types', itemController.getItemTypes);
router.post('/item-types', itemController.createItemType);
router.put('/item-types/:id', itemController.updateItemType);
router.delete('/item-types/:id', itemController.deleteItemType);

router.get('/subtypes', itemController.getSubTypes);
router.post('/subtypes', itemController.createSubType);
router.put('/subtypes/:id', itemController.updateSubType);
router.delete('/subtypes/:id', itemController.deleteSubType);

// ── Units ──
router.get('/units', itemController.getUnits);
router.post('/units', itemController.createUnit);
router.put('/units/:id', itemController.updateUnit);
router.delete('/units/:id', itemController.deleteUnit);

// ── Item Master ──
router.get('/items', itemController.getItems);
router.get('/items/next-code', itemController.getNextItemCode);
router.get('/items/:id', itemController.getItem);
router.post('/items', itemController.createItem);
router.put('/items/:id', itemController.updateItem);
router.delete('/items/:id', itemController.deleteItem);

// ── GRN (Goods Receipt Note / GRR) ──
router.get('/grn', grnController.getGRNs);
router.get('/grn/next-number', grnController.getNextGRNNumber);
router.get('/grn/pending-billing', grnController.getPendingBilling);
router.put('/grn/batch-mark-billed', grnController.batchMarkGRRBilled);
router.put('/grn/:id/mark-billed', grnController.markGRRBilled);
router.get('/grn/:id', grnController.getGRN);
router.post('/grn', grnController.createGRN);
router.put('/grn/:id', grnController.updateGRN);
router.put('/grn/:id/approve', grnController.approveGRN);
router.delete('/grn/:id', grnController.deleteGRN);

// ── GRR Reports ──
router.get('/reports/grr-register', grrReportController.getGRRRegister);
router.get('/reports/grr-pending', grrReportController.getPendingGRRs);
router.get('/reports/grr-summary', grrReportController.getGRRSummaryBySupplier);
router.get('/reports/grr-item-details', grrReportController.getGRRItemDetails);
router.get('/reports/grr-qa', grrReportController.getGRRQASummary);

// ── Material Requisition ──
router.get('/material-requisitions', materialRequisitionController.getList);
router.get('/material-requisitions/next-number', materialRequisitionController.getNextNumber);
router.get('/material-requisitions/:id', materialRequisitionController.getOne);
router.post('/material-requisitions', materialRequisitionController.create);
router.put('/material-requisitions/:id', materialRequisitionController.update);
router.put('/material-requisitions/:id/submit', materialRequisitionController.submitForApproval);
router.put('/material-requisitions/:id/approve', materialRequisitionController.approve);
router.put('/material-requisitions/:id/approve-items', materialRequisitionController.approveItems);
router.put('/material-requisitions/:id/reject', materialRequisitionController.reject);
router.post('/material-requisitions/:id/convert-to-pr', materialRequisitionController.convertToPR);
router.post('/material-requisitions/:id/pr-preview', materialRequisitionController.prPreview);
router.post('/material-requisitions/:id/create-pr', materialRequisitionController.createPRFromMR);
router.delete('/material-requisitions/:id', materialRequisitionController.delete);

// ── Material Issue ──
router.get('/material-issues', materialIssueController.getList);
router.get('/material-issues/next-number', materialIssueController.getNextNumber);
router.get('/material-issues/:id', materialIssueController.getOne);
router.post('/material-issues', materialIssueController.create);
router.put('/material-issues/:id', materialIssueController.update);
router.post('/material-issues/:id/convert-to-pr', materialIssueController.convertToPR);
router.post('/material-issues/:id/pr-preview', materialIssueController.prPreview);
router.post('/material-issues/:id/create-pr', materialIssueController.createPRFromIssue);
router.delete('/material-issues/:id', materialIssueController.delete);

// ── Stock Ledger ──
router.get('/stock-ledger', stockLedgerController.getStockLedger);
router.get('/day-wise-stock', stockReportController.getDayWiseStock);

// ── Stock Audit / Physical Verification ──
router.get('/stock-audit', stockAuditController.getList);
router.get('/stock-audit/:id', stockAuditController.getOne);
router.post('/stock-audit', stockAuditController.create);
router.put('/stock-audit/:id', stockAuditController.update);
router.put('/stock-audit/:id/approve', stockAuditController.approve);
router.delete('/stock-audit/:id', stockAuditController.delete);

// ── Gate Entry ──
router.get('/gate-entry', gateEntryController.getList);
router.get('/gate-entry/:id', gateEntryController.getOne);
router.post('/gate-entry', gateEntryController.create);
router.put('/gate-entry/:id', gateEntryController.update);
router.delete('/gate-entry/:id', gateEntryController.delete);

// ── Material Return ──
router.get('/material-returns', materialReturnController.getList);
router.get('/material-returns/:id', materialReturnController.getOne);
router.post('/material-returns', materialReturnController.create);
router.put('/material-returns/:id', materialReturnController.update);
router.delete('/material-returns/:id', materialReturnController.delete);

// ── Delivery Challan ──
router.get('/delivery-challans', deliveryChallanController.getList);
router.get('/delivery-challans/next-number', deliveryChallanController.getNextNumber);
router.get('/delivery-challans/pending-billing', deliveryChallanController.getPendingBilling);
router.get('/delivery-challans/by-party/:partyId', deliveryChallanController.getByParty);
router.get('/delivery-challans/:id', deliveryChallanController.getOne);
router.post('/delivery-challans', deliveryChallanController.create);
router.put('/delivery-challans/:id', deliveryChallanController.update);
router.post('/delivery-challans/:id/approve', deliveryChallanController.approve);
router.post('/delivery-challans/:id/cancel', deliveryChallanController.cancel);
router.post('/delivery-challans/:id/return', deliveryChallanController.returnDc);
router.post('/delivery-challans/bill', deliveryChallanController.billDc);
router.delete('/delivery-challans/:id', deliveryChallanController.remove);

// ── Billing (Tax Invoice) ──
router.get('/bills/next-number', billingController.getNextBillNo);
router.get('/invoices', billingController.getList);
router.get('/invoices/:id', billingController.getOne);
router.post('/invoices', billingController.create);
router.post('/bills', billingController.create);
router.put('/invoices/:id', billingController.update);
router.post('/invoices/:id/bill', billingController.markBilled);
router.delete('/invoices/:id', billingController.remove);

// ── Stores Settings ──
router.get('/settings', storesSettingsController.getSettings);
router.put('/settings', storesSettingsController.updateSettings);

module.exports = router;
