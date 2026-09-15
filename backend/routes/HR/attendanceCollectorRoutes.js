const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const ctrl = require('../../controllers/HR/attendanceCollectorController');

router.get('/punches', requirePermission(HR_PERMISSIONS.ATT_COLLECTOR), ctrl.getPunches);
router.get('/batches', requirePermission(HR_PERMISSIONS.ATT_COLLECTOR), ctrl.getBatches);
router.post('/import-csv', requirePermission(HR_PERMISSIONS.ATT_COLLECTOR), ctrl.upload, ctrl.importCsv);
router.post('/push', ctrl.pushPunch);
router.post('/bulk-push', ctrl.bulkPushPunches);
router.post('/manual', requirePermission(HR_PERMISSIONS.ATT_ENTRY), ctrl.manualPunch);
router.post('/process', requirePermission(HR_PERMISSIONS.ATT_ENTRY), ctrl.processPunches);

module.exports = router;
