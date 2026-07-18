const express = require('express');
const router = express.Router();
const productionOrderController = require('../../controllers/ERP/productionOrderController');
const machineController = require('../../controllers/ERP/productionMachineController');
const dailyEntryController = require('../../controllers/ERP/productionDailyEntryController');
const downtimeController = require('../../controllers/ERP/productionDowntimeController');
const dashboardController = require('../../controllers/ERP/productionDashboardController');
const reportController = require('../../controllers/ERP/productionReportController');
const settingsController = require('../../controllers/ERP/productionSettingsController');

router.get('/dashboard', dashboardController.stats);

router.get('/orders', productionOrderController.getList);
router.get('/orders/:id', productionOrderController.getOne);
router.post('/orders', productionOrderController.create);
router.put('/orders/:id/status', productionOrderController.updateStatus);
router.post('/orders/:id/issue-material', productionOrderController.issueMaterial);
router.delete('/orders/:id', productionOrderController.delete);

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
