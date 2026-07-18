const express = require('express');
const router = express.Router();

const customerController = require('../../controllers/ERP/customerController');
const leadController = require('../../controllers/ERP/leadController');
const quotationController = require('../../controllers/ERP/quotationController');
const salesOrderController = require('../../controllers/ERP/salesOrderController');
const dashboardController = require('../../controllers/ERP/marketingDashboardController');
const reportController = require('../../controllers/ERP/marketingReportController');
const settingsController = require('../../controllers/ERP/marketingSettingsController');

// ── Dashboard ──
router.get('/dashboard', dashboardController.stats);

// ── Customers ──
router.get('/customers', customerController.list);
router.get('/customers/:id', customerController.get);
router.post('/customers', customerController.create);
router.put('/customers/:id', customerController.update);
router.delete('/customers/:id', customerController.remove);

// ── Leads ──
router.get('/leads', leadController.list);
router.get('/leads/:id', leadController.get);
router.post('/leads', leadController.create);
router.put('/leads/:id', leadController.update);
router.delete('/leads/:id', leadController.remove);

// ── Quotations ──
router.get('/quotations', quotationController.list);
router.get('/quotations/:id', quotationController.get);
router.post('/quotations', quotationController.create);
router.put('/quotations/:id', quotationController.update);
router.delete('/quotations/:id', quotationController.remove);
router.post('/quotations/:id/convert-to-order', quotationController.convertToOrder);

// ── Sales Orders ──
router.get('/orders', salesOrderController.list);
router.get('/orders/:id', salesOrderController.get);
router.post('/orders', salesOrderController.create);
router.put('/orders/:id', salesOrderController.update);
router.delete('/orders/:id', salesOrderController.remove);

// ── Reports ──
router.get('/reports/lead-pipeline', reportController.leadPipeline);
router.get('/reports/quote-conversion', reportController.quoteConversion);
router.get('/reports/order-summary', reportController.orderSummary);

// ── Settings ──
router.get('/settings', settingsController.get);
router.put('/settings', settingsController.update);

module.exports = router;
