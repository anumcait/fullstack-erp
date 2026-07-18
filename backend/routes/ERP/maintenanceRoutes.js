const express = require('express');
const router = express.Router();
const machineController = require('../../controllers/ERP/maintenanceMachineController');
const assetController = require('../../controllers/ERP/maintenanceAssetController');
const scheduleController = require('../../controllers/ERP/maintenanceScheduleController');
const dashboardController = require('../../controllers/ERP/maintenanceDashboardController');
const reportController = require('../../controllers/ERP/maintenanceReportController');
const settingsController = require('../../controllers/ERP/maintenanceSettingsController');

router.get('/dashboard', dashboardController.stats);

router.get('/machines', machineController.list);
router.get('/machines/:id', machineController.get);
router.post('/machines', machineController.create);
router.put('/machines/:id', machineController.update);
router.delete('/machines/:id', machineController.remove);

router.get('/assets', assetController.list);
router.get('/assets/:id', assetController.get);
router.post('/assets', assetController.create);
router.put('/assets/:id', assetController.update);
router.delete('/assets/:id', assetController.remove);

router.get('/schedules', scheduleController.list);
router.get('/schedules/:id', scheduleController.get);
router.post('/schedules', scheduleController.create);
router.put('/schedules/:id', scheduleController.update);
router.delete('/schedules/:id', scheduleController.remove);

router.get('/reports/machine-status', reportController.machineStatus);
router.get('/reports/schedule-status', reportController.scheduleStatus);

router.get('/settings', settingsController.get);
router.put('/settings', settingsController.update);

module.exports = router;
