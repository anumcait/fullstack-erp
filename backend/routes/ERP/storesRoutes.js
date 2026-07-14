const express = require('express');
const router = express.Router();
const storesController = require('../../controllers/ERP/storesController');
const itemController = require('../../controllers/ERP/itemController');
const grnController = require('../../controllers/ERP/grnController');
const materialRequisitionController = require('../../controllers/ERP/materialRequisitionController');
const materialIssueController = require('../../controllers/ERP/materialIssueController');
const stockLedgerController = require('../../controllers/ERP/stockLedgerController');
const stockAuditController = require('../../controllers/ERP/stockAuditController');
const gateEntryController = require('../../controllers/ERP/gateEntryController');
const materialReturnController = require('../../controllers/ERP/materialReturnController');
const storesSettingsController = require('../../controllers/ERP/storesSettingsController');

// ── Dashboard ──
router.get('/dashboard', storesController.getDashboardStats);

// ── Stock ──
router.get('/stock', storesController.getStock);
router.get('/material-requisitions/:id/stock-check', storesController.checkStockForMR);

// ── Item Categories ──
router.get('/categories', itemController.getCategories);
router.post('/categories', itemController.createCategory);
router.put('/categories/:id', itemController.updateCategory);
router.delete('/categories/:id', itemController.deleteCategory);

// ── Units ──
router.get('/units', itemController.getUnits);
router.post('/units', itemController.createUnit);
router.put('/units/:id', itemController.updateUnit);
router.delete('/units/:id', itemController.deleteUnit);

// ── Item Master ──
router.get('/items', itemController.getItems);
router.get('/items/:id', itemController.getItem);
router.post('/items', itemController.createItem);
router.put('/items/:id', itemController.updateItem);
router.delete('/items/:id', itemController.deleteItem);

// ── GRN (Goods Receipt Note) ──
router.get('/grn', grnController.getGRNs);
router.get('/grn/:id', grnController.getGRN);
router.post('/grn', grnController.createGRN);
router.put('/grn/:id', grnController.updateGRN);
router.delete('/grn/:id', grnController.deleteGRN);

// ── Material Requisition ──
router.get('/material-requisitions', materialRequisitionController.getList);
router.get('/material-requisitions/:id', materialRequisitionController.getOne);
router.post('/material-requisitions', materialRequisitionController.create);
router.put('/material-requisitions/:id', materialRequisitionController.update);
router.put('/material-requisitions/:id/approve', materialRequisitionController.approve);
router.post('/material-requisitions/:id/convert-to-pr', materialRequisitionController.convertToPR);
router.delete('/material-requisitions/:id', materialRequisitionController.delete);

// ── Material Issue ──
router.get('/material-issues', materialIssueController.getList);
router.get('/material-issues/:id', materialIssueController.getOne);
router.post('/material-issues', materialIssueController.create);
router.delete('/material-issues/:id', materialIssueController.delete);

// ── Stock Ledger ──
router.get('/stock-ledger', stockLedgerController.getStockLedger);

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
router.delete('/material-returns/:id', materialReturnController.delete);

// ── Stores Settings ──
router.get('/settings', storesSettingsController.getSettings);
router.put('/settings', storesSettingsController.updateSettings);

module.exports = router;
