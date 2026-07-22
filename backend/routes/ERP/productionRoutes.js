const express = require('express');
const router = express.Router();
const jobOrderController = require('../../controllers/ERP/jobOrderController');
const machineController = require('../../controllers/ERP/productionMachineController');
const dailyEntryController = require('../../controllers/ERP/productionDailyEntryController');
const downtimeController = require('../../controllers/ERP/productionDowntimeController');
const dashboardController = require('../../controllers/ERP/productionDashboardController');
const reportController = require('../../controllers/ERP/productionReportController');
const settingsController = require('../../controllers/ERP/productionSettingsController');

router.get('/dashboard', dashboardController.stats);

router.get('/job-orders', jobOrderController.getList);
router.get('/job-orders/:id', jobOrderController.getOne);
router.post('/job-orders', jobOrderController.create);
router.put('/job-orders/:id', jobOrderController.update);
router.put('/job-orders/:id/status', jobOrderController.updateStatus);
router.post('/job-orders/:id/issue-material', jobOrderController.issueMaterial);
router.delete('/job-orders/:id', jobOrderController.delete);

router.get('/machines', machineController.list);
router.get('/machines/:id', machineController.get);
router.post('/machines', machineController.create);
router.put('/machines/:id', machineController.update);
router.delete('/machines/:id', machineController.remove);

router.get('/daily-entry', dailyEntryController.list);
router.get('/daily-entry/:id', dailyEntryController.get);
router.post('/daily-entry', dailyEntryController.create);
router.put('/daily-entry/:id', dailyEntryController.update);
router.delete('/daily-entry/:id', dailyEntryController.remove);

router.get('/downtime', downtimeController.list);
router.get('/downtime/:id', downtimeController.get);
router.post('/downtime', downtimeController.create);
router.put('/downtime/:id', downtimeController.update);
router.delete('/downtime/:id', downtimeController.remove);

router.get('/reports/order-status', reportController.orderStatus);
router.get('/reports/daily-summary', reportController.dailySummary);
router.get('/reports/downtime-analysis', reportController.downtimeAnalysis);

router.get('/settings', settingsController.get);
router.put('/settings', settingsController.update);

module.exports = router;
