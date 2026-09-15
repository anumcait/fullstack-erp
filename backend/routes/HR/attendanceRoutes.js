const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const attendanceController = require('../../controllers/HR/attendanceController');

router.post('/save', requirePermission(HR_PERMISSIONS.ATT_ENTRY), attendanceController.saveAttendance);
router.post('/save-bulk', requirePermission(HR_PERMISSIONS.ATT_ENTRY), attendanceController.saveBulkAttendance);
router.post('/import', requirePermission(HR_PERMISSIONS.ATT_ENTRY), attendanceController.importAttendance);
router.get('/', requirePermission(HR_PERMISSIONS.ATT_ENTRY), attendanceController.getAttendance);
router.put('/:id', requirePermission(HR_PERMISSIONS.ATT_MOD), attendanceController.updateAttendance);
router.delete('/:id', requirePermission(HR_PERMISSIONS.ATT_MOD), attendanceController.deleteAttendance);
router.get('/summary', attendanceController.getEmployeeAttendanceSummary);
router.get('/muster-roll', requirePermission(HR_PERMISSIONS.MUSTER), attendanceController.getMusterRoll);
router.get('/shift-schedule', attendanceController.getShiftScheduleForAttendance);
router.get('/ot-approval', requirePermission(HR_PERMISSIONS.OT_APP), attendanceController.getOTForApproval);
router.put('/ot-approval/:id', requirePermission(HR_PERMISSIONS.OT_APP), attendanceController.approveOT);
router.post('/ot-approval/bulk', requirePermission(HR_PERMISSIONS.OT_APP), attendanceController.bulkApproveOT);
router.post('/save-muster-summary', requirePermission(HR_PERMISSIONS.MUSTER), attendanceController.saveMusterRollSummary);
router.get('/late-report', requirePermission(HR_PERMISSIONS.MUSTER), attendanceController.getLateReport);

module.exports = router;
