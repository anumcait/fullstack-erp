const express = require('express');
const router = express.Router();

const inspectionController = require('../../controllers/ERP/qualityInspectionController');
const ncController = require('../../controllers/ERP/qualityNcController');
const dashboardController = require('../../controllers/ERP/qualityDashboardController');
const reportController = require('../../controllers/ERP/qualityReportController');
const settingsController = require('../../controllers/ERP/qualitySettingsController');

router.get('/dashboard', dashboardController.stats);

router.get('/inspections', inspectionController.list);
router.get('/inspections/:id', inspectionController.get);
router.post('/inspections', inspectionController.create);
router.put('/inspections/:id', inspectionController.update);
router.delete('/inspections/:id', inspectionController.remove);

router.get('/non-conformances', ncController.list);
router.get('/non-conformances/:id', ncController.get);
router.post('/non-conformances', ncController.create);
router.put('/non-conformances/:id', ncController.update);
router.delete('/non-conformances/:id', ncController.remove);

router.get('/reports/rejection-analysis', reportController.rejectionAnalysis);
router.get('/reports/nc-summary', reportController.ncSummary);
router.get('/reports/inspection-summary', reportController.inspectionSummary);

router.get('/settings', settingsController.get);
router.put('/settings', settingsController.update);

module.exports = router;
