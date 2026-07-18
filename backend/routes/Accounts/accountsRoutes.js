const express = require('express');
const router = express.Router();

const coaController = require('../../controllers/Accounts/coaController');
const voucherController = require('../../controllers/Accounts/voucherController');
const ledgerController = require('../../controllers/Accounts/ledgerController');
const financialReportController = require('../../controllers/Accounts/financialReportController');
const budgetController = require('../../controllers/Accounts/budgetController');
const settingsController = require('../../controllers/Accounts/accountsSettingsController');
const dashboardController = require('../../controllers/Accounts/dashboardController');

// ── Dashboard ──
router.get('/dashboard', dashboardController.stats);

// ── Chart of Accounts ──
router.get('/coa', coaController.list);
router.get('/coa/tree', coaController.tree);
router.get('/coa/:id', coaController.get);
router.post('/coa', coaController.create);
router.put('/coa/:id', coaController.update);
router.delete('/coa/:id', coaController.remove);

// ── Vouchers ──
router.get('/vouchers', voucherController.list);
router.get('/vouchers/types', voucherController.getTypes);
router.get('/vouchers/:id', voucherController.get);
router.post('/vouchers', voucherController.create);
router.put('/vouchers/:id', voucherController.update);
router.delete('/vouchers/:id', voucherController.remove);
router.post('/vouchers/:id/post', voucherController.post);
router.post('/vouchers/:id/cancel', voucherController.cancel);

// ── Ledger & Reports ──
router.get('/ledger', ledgerController.ledger);
router.get('/daybook', ledgerController.daybook);
router.get('/trial-balance', ledgerController.trialBalance);

// ── Financial Reports ──
router.get('/reports/profit-loss', financialReportController.profitLoss);
router.get('/reports/balance-sheet', financialReportController.balanceSheet);
router.get('/reports/aging', financialReportController.agingReport);

// ── Budget ──
router.get('/budgets', budgetController.list);
router.post('/budgets', budgetController.upsert);
router.delete('/budgets/:id', budgetController.remove);
router.get('/budgets/vs-actual', budgetController.vsActual);

// ── Settings & Financial Years ──
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);
router.get('/financial-years', settingsController.getFinancialYears);
router.post('/financial-years', settingsController.createFinancialYear);
router.post('/financial-years/:id/set-active', settingsController.setActiveFinancialYear);

module.exports = router;
