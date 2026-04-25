const express = require('express');
const router = express.Router();
const attendanceController = require('../../controllers/HR/attendanceController');

router.post('/save', attendanceController.saveAttendance);
router.post('/save-bulk', attendanceController.saveBulkAttendance);
router.post('/import', attendanceController.importAttendance);
router.get('/', attendanceController.getAttendance);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);
router.get('/summary', attendanceController.getEmployeeAttendanceSummary);
router.get('/muster-roll', attendanceController.getMusterRoll);
router.get('/shift-schedule', attendanceController.getShiftScheduleForAttendance);
router.get('/ot-approval', attendanceController.getOTForApproval);
router.put('/ot-approval/:id', attendanceController.approveOT);
router.post('/ot-approval/bulk', attendanceController.bulkApproveOT);
router.get('/late-report', attendanceController.getLateReport);

module.exports = router;
