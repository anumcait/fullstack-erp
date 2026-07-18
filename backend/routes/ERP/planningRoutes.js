const express = require('express');
const router = express.Router();
const scheduleController = require('../../controllers/ERP/planningScheduleController');
const mrpController = require('../../controllers/ERP/planningMRPController');
const capacityController = require('../../controllers/ERP/planningCapacityController');
const dashboardController = require('../../controllers/ERP/planningDashboardController');
const reportController = require('../../controllers/ERP/planningReportController');
const settingsController = require('../../controllers/ERP/planningSettingsController');

router.get('/dashboard', dashboardController.stats);

router.get('/schedules', scheduleController.list);
router.get('/schedules/gantt', scheduleController.gantt);
router.get('/schedules/calendar', scheduleController.calendar);
router.get('/schedules/conflicts', scheduleController.checkConflicts);
router.post('/schedules/auto-schedule', scheduleController.autoSchedule);
router.get('/schedules/:id', scheduleController.get);
router.post('/schedules', scheduleController.create);
router.put('/schedules/:id', scheduleController.update);
router.put('/schedules/:id/reschedule', scheduleController.reschedule);
router.delete('/schedules/:id', scheduleController.remove);

router.get('/mrp', mrpController.list);
router.get('/mrp/:id', mrpController.get);
router.post('/mrp', mrpController.create);
router.put('/mrp/:id', mrpController.update);
router.delete('/mrp/:id', mrpController.remove);

router.get('/capacity', capacityController.list);
router.get('/capacity/:id', capacityController.get);
router.post('/capacity', capacityController.create);
router.put('/capacity/:id', capacityController.update);
router.delete('/capacity/:id', capacityController.remove);

router.get('/reports/schedule-status', reportController.scheduleStatus);
router.get('/reports/mrp-summary', reportController.mrpSummary);

router.get('/settings', settingsController.get);
router.put('/settings', settingsController.update);

module.exports = router;
