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
const inwardRegisterController = require('../../controllers/ERP/inwardRegisterController');
const billingController = require('../../controllers/ERP/billingController');
const miscVoucherController = require('../../controllers/ERP/miscVoucherController');
const storesSettingsController = require('../../controllers/ERP/storesSettingsController');
const storesReportController = require('../../controllers/ERP/storesReportController');
const grrReportController = require('../../controllers/ERP/grrReportController');
const approvalController = require('../../controllers/ERP/approvalController');
const inventoryReportController = require('../../controllers/ERP/inventoryReportController');
const warehouseController = require('../../controllers/ERP/warehouseController');
const batchController = require('../../controllers/ERP/batchController');
const { requirePermission } = require('../../middleware/auth');
const S = require('../../constants/permissions').STORES;

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

// ── Inventory Ledger & Reports (bank-account style) ──
router.get('/inventory/statement', inventoryReportController.getStockStatement);
router.get('/inventory/valuation', inventoryReportController.getValuation);
router.get('/inventory/stock-ledger', inventoryReportController.getStockLedger);
router.get('/inventory/aging', inventoryReportController.getStockAging);
router.get('/inventory/slow-moving', inventoryReportController.getSlowMoving);
router.get('/inventory/fast-moving', inventoryReportController.getFastMoving);
router.get('/inventory/negative-stock', inventoryReportController.getNegativeStock);
router.get('/inventory/dead-stock', inventoryReportController.getDeadStock);
router.get('/inventory/batches', inventoryReportController.getBatchReport);
router.get('/inventory/adjustments', inventoryReportController.getAdjustmentReport);
router.get('/inventory/profit-loss', inventoryReportController.getProfitLoss);
router.get('/inventory/audit-trail', inventoryReportController.getAuditTrail);
router.get('/inventory/reconciliation', inventoryReportController.getReconciliation);
router.get('/inventory/warehouse-wise', inventoryReportController.getWarehouseWise);

// ── Warehouse Master ──
router.get('/warehouses', warehouseController.getList);
router.get('/warehouses/:id', warehouseController.getOne);
router.post('/warehouses', requirePermission(S.ITEM_MANAGE), warehouseController.create);
router.put('/warehouses/:id', requirePermission(S.ITEM_MANAGE), warehouseController.update);
router.delete('/warehouses/:id', requirePermission(S.ITEM_MANAGE), warehouseController.remove);

// ── Batch Master ──
router.get('/batches', batchController.getList);
router.post('/batches', requirePermission(S.ITEM_MANAGE), batchController.create);
router.put('/batches/:id', requirePermission(S.ITEM_MANAGE), batchController.update);
router.delete('/batches/:id', requirePermission(S.ITEM_MANAGE), batchController.remove);

// ── Item Group / Sub Group / Type / Sub Type (4-level classification) ──
router.get('/groups', itemController.getGroups);
router.post('/groups', requirePermission(S.ITEM_MANAGE), itemController.createGroup);
router.put('/groups/:id', requirePermission(S.ITEM_MANAGE), itemController.updateGroup);
router.delete('/groups/:id', requirePermission(S.ITEM_MANAGE), itemController.deleteGroup);

// Alias used by the Item Master (AddItem) UI for the "Item Group" lookup/create.
// Frontend refers to the item group as "category" — keep both endpoints in sync.
router.get('/categories', itemController.getGroups);
router.post('/categories', requirePermission(S.ITEM_MANAGE), itemController.createGroup);

router.get('/subgroups', itemController.getSubGroups);
router.post('/subgroups', requirePermission(S.ITEM_MANAGE), itemController.createSubGroup);
router.put('/subgroups/:id', requirePermission(S.ITEM_MANAGE), itemController.updateSubGroup);
router.delete('/subgroups/:id', requirePermission(S.ITEM_MANAGE), itemController.deleteSubGroup);

router.get('/item-types', itemController.getItemTypes);
router.post('/item-types', requirePermission(S.ITEM_MANAGE), itemController.createItemType);
router.put('/item-types/:id', requirePermission(S.ITEM_MANAGE), itemController.updateItemType);
router.delete('/item-types/:id', requirePermission(S.ITEM_MANAGE), itemController.deleteItemType);

router.get('/subtypes', itemController.getSubTypes);
router.post('/subtypes', requirePermission(S.ITEM_MANAGE), itemController.createSubType);
router.put('/subtypes/:id', requirePermission(S.ITEM_MANAGE), itemController.updateSubType);
router.delete('/subtypes/:id', requirePermission(S.ITEM_MANAGE), itemController.deleteSubType);

// ── Units ──
router.get('/units', itemController.getUnits);
router.post('/units', requirePermission(S.ITEM_MANAGE), itemController.createUnit);
router.put('/units/:id', requirePermission(S.ITEM_MANAGE), itemController.updateUnit);
router.delete('/units/:id', requirePermission(S.ITEM_MANAGE), itemController.deleteUnit);

// ── Item Master ──
router.get('/items', itemController.getItems);
router.get('/items/next-code', itemController.getNextItemCode);
router.get('/items/:id', itemController.getItem);
router.post('/items', requirePermission(S.ITEM_MANAGE), itemController.createItem);
router.put('/items/:id', requirePermission(S.ITEM_MANAGE), itemController.updateItem);
router.delete('/items/:id', requirePermission(S.ITEM_MANAGE), itemController.deleteItem);

// ── GRN (Goods Receipt Note / GRR) ──
router.get('/grn', grnController.getGRNs);
router.get('/grn/next-number', grnController.getNextGRNNumber);
router.get('/grn/pending-billing', grnController.getPendingBilling);
router.put('/grn/batch-mark-billed', grnController.batchMarkGRRBilled);
router.put('/grn/:id/mark-billed', grnController.markGRRBilled);
router.get('/grn/:id', grnController.getGRN);
router.post('/grn', requirePermission(S.GRN_POST), grnController.createGRN);
router.put('/grn/:id', requirePermission(S.GRN_POST), grnController.updateGRN);
router.put('/grn/:id/approve', requirePermission(S.GRN_POST), grnController.approveGRN);
router.delete('/grn/:id', requirePermission(S.GRN_POST), grnController.deleteGRN);

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
router.post('/material-requisitions', requirePermission(S.MISSUE_CREATE), materialRequisitionController.create);
router.put('/material-requisitions/:id', requirePermission(S.MISSUE_CREATE), materialRequisitionController.update);
router.put('/material-requisitions/:id/submit', requirePermission(S.MISSUE_CREATE), materialRequisitionController.submitForApproval);
router.put('/material-requisitions/:id/approve', requirePermission(S.MISSUE_CREATE), materialRequisitionController.approve);
router.put('/material-requisitions/:id/approve-items', requirePermission(S.MISSUE_CREATE), materialRequisitionController.approveItems);
router.put('/material-requisitions/:id/reject', requirePermission(S.MISSUE_CREATE), materialRequisitionController.reject);
router.post('/material-requisitions/:id/convert-to-pr', requirePermission(S.MISSUE_CREATE), materialRequisitionController.convertToPR);
router.post('/material-requisitions/:id/pr-preview', requirePermission(S.MISSUE_CREATE), materialRequisitionController.prPreview);
router.post('/material-requisitions/:id/create-pr', requirePermission(S.MISSUE_CREATE), materialRequisitionController.createPRFromMR);
router.delete('/material-requisitions/:id', requirePermission(S.MISSUE_CREATE), materialRequisitionController.delete);

// ── Material Issue ──
router.get('/material-issues', materialIssueController.getList);
router.get('/material-issues/next-number', materialIssueController.getNextNumber);
router.get('/material-issues/:id', materialIssueController.getOne);
router.post('/material-issues', requirePermission(S.MISSUE_CREATE), materialIssueController.create);
router.put('/material-issues/:id', requirePermission(S.MISSUE_CREATE), materialIssueController.update);
router.post('/material-issues/:id/convert-to-pr', requirePermission(S.MISSUE_CREATE), materialIssueController.convertToPR);
router.post('/material-issues/:id/pr-preview', requirePermission(S.MISSUE_CREATE), materialIssueController.prPreview);
router.post('/material-issues/:id/create-pr', requirePermission(S.MISSUE_CREATE), materialIssueController.createPRFromIssue);
router.delete('/material-issues/:id', requirePermission(S.MISSUE_CREATE), materialIssueController.delete);

// ── Stock Ledger ──
router.get('/stock-ledger', stockLedgerController.getStockLedger);
router.get('/day-wise-stock', stockReportController.getDayWiseStock);

// ── Stock Audit / Physical Verification ──
router.get('/stock-audit', stockAuditController.getList);
router.get('/stock-audit/:id', stockAuditController.getOne);
router.post('/stock-audit', requirePermission(S.STOCK_ADJUST), stockAuditController.create);
router.put('/stock-audit/:id', requirePermission(S.STOCK_ADJUST), stockAuditController.update);
router.put('/stock-audit/:id/approve', requirePermission(S.STOCK_ADJUST), stockAuditController.approve);
router.delete('/stock-audit/:id', requirePermission(S.STOCK_ADJUST), stockAuditController.delete);

// ── Gate Entry ──
router.get('/gate-entry', gateEntryController.getList);
router.get('/gate-entry/:id', gateEntryController.getOne);
router.post('/gate-entry', requirePermission(S.GRN_POST), gateEntryController.create);
router.put('/gate-entry/:id', requirePermission(S.GRN_POST), gateEntryController.update);
router.delete('/gate-entry/:id', requirePermission(S.GRN_POST), gateEntryController.delete);

// ── Material Return ──
router.get('/material-returns', materialReturnController.getList);
router.get('/material-returns/:id', materialReturnController.getOne);
router.post('/material-returns', requirePermission(S.MRETURN_CREATE), materialReturnController.create);
router.put('/material-returns/:id', requirePermission(S.MRETURN_CREATE), materialReturnController.update);
router.delete('/material-returns/:id', requirePermission(S.MRETURN_CREATE), materialReturnController.delete);

// ── Delivery Challan ──
router.get('/delivery-challans', deliveryChallanController.getList);
router.get('/delivery-challans/next-number', deliveryChallanController.getNextNumber);
router.get('/delivery-challans/pending-billing', deliveryChallanController.getPendingBilling);
router.get('/delivery-challans/by-party/:partyId', deliveryChallanController.getByParty);
router.get('/delivery-challans/:id', deliveryChallanController.getOne);
router.post('/delivery-challans', requirePermission(S.MISSUE_CREATE), deliveryChallanController.create);
router.put('/delivery-challans/:id', requirePermission(S.MISSUE_CREATE), deliveryChallanController.update);
router.post('/delivery-challans/:id/approve', requirePermission(S.MISSUE_CREATE), deliveryChallanController.approve);
router.post('/delivery-challans/:id/cancel', requirePermission(S.MISSUE_CREATE), deliveryChallanController.cancel);
router.post('/delivery-challans/:id/return', requirePermission(S.MISSUE_CREATE), deliveryChallanController.returnDc);
router.post('/delivery-challans/bill', requirePermission(S.MISSUE_CREATE), deliveryChallanController.billDc);
router.delete('/delivery-challans/:id', requirePermission(S.MISSUE_CREATE), deliveryChallanController.remove);

// ── Inward Register (IR) ──
router.get('/inward-registers', inwardRegisterController.getList);
router.get('/inward-registers/next-number', inwardRegisterController.getNextNumber);
router.get('/inward-registers/pending-dcs', inwardRegisterController.getPendingDCs);
router.get('/inward-registers/pending-billing', inwardRegisterController.getPendingBilling);
router.post('/inward-registers/bill', inwardRegisterController.billIr);
router.get('/inward-registers/:id', inwardRegisterController.getOne);
router.post('/inward-registers', requirePermission(S.GRN_POST), inwardRegisterController.create);
router.put('/inward-registers/:id', requirePermission(S.GRN_POST), inwardRegisterController.update);
router.post('/inward-registers/:id/approve', requirePermission(S.GRN_POST), inwardRegisterController.approve);
router.post('/inward-registers/:id/cancel', requirePermission(S.GRN_POST), inwardRegisterController.cancel);
router.delete('/inward-registers/:id', requirePermission(S.GRN_POST), inwardRegisterController.remove);

// ── Billing (Tax Invoice) ──
router.get('/bills/next-number', billingController.getNextBillNo);
router.get('/invoices', billingController.getList);
router.get('/invoices/:id', billingController.getOne);
router.post('/invoices', requirePermission(S.GRN_POST), billingController.create);
router.post('/bills', requirePermission(S.GRN_POST), billingController.create);
router.put('/invoices/:id', requirePermission(S.GRN_POST), billingController.update);
router.post('/invoices/:id/bill', requirePermission(S.GRN_POST), billingController.markBilled);
router.delete('/invoices/:id', requirePermission(S.GRN_POST), billingController.remove);

// ── Miscellaneous / Petty Cash Voucher ──
router.get('/misc-vouchers/next-number', miscVoucherController.getNextNumber);
router.get('/misc-vouchers', miscVoucherController.getList);
router.get('/misc-vouchers/:id', miscVoucherController.getOne);
router.post('/misc-vouchers', requirePermission(S.STOCK_ADJUST), miscVoucherController.create);
router.put('/misc-vouchers/:id', requirePermission(S.STOCK_ADJUST), miscVoucherController.update);
router.post('/misc-vouchers/:id/approve', requirePermission(S.STOCK_ADJUST), miscVoucherController.approve);
router.delete('/misc-vouchers/:id', requirePermission(S.STOCK_ADJUST), miscVoucherController.remove);

// ── Stores Settings ──
router.get('/settings', storesSettingsController.getSettings);
router.put('/settings', requirePermission(S.ITEM_MANAGE), storesSettingsController.updateSettings);

module.exports = router;
