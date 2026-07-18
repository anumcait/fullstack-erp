const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/ERP/subcontractOrderController');
const issueController = require('../../controllers/ERP/subcontractIssueController');
const receiptController = require('../../controllers/ERP/subcontractReceiptController');
const dashboardController = require('../../controllers/ERP/subcontractDashboardController');
const reportController = require('../../controllers/ERP/subcontractReportController');
const settingsController = require('../../controllers/ERP/subcontractSettingsController');

router.get('/dashboard', dashboardController.stats);

router.get('/orders', orderController.list);
router.get('/orders/:id', orderController.get);
router.post('/orders', orderController.create);
router.put('/orders/:id', orderController.update);
router.delete('/orders/:id', orderController.remove);

router.get('/issues', issueController.list);
router.get('/issues/:id', issueController.get);
router.post('/issues', issueController.create);
router.put('/issues/:id', issueController.update);
router.delete('/issues/:id', issueController.remove);

router.get('/receipts', receiptController.list);
router.get('/receipts/:id', receiptController.get);
router.post('/receipts', receiptController.create);
router.put('/receipts/:id', receiptController.update);
router.delete('/receipts/:id', receiptController.remove);

router.get('/reports/order-status', reportController.orderStatus);
router.get('/reports/vendor-summary', reportController.vendorSummary);
router.get('/reports/monthly-trend', reportController.monthlyTrend);

router.get('/settings', settingsController.get);
router.put('/settings', settingsController.update);

module.exports = router;
