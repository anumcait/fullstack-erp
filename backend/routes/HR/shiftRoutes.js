const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const shiftController = require('../../controllers/HR/shiftController');

router.post('/save', requirePermission(HR_PERMISSIONS.SHIFT_CHG), shiftController.saveSChange);
router.get('/next-id', shiftController.getNextSchangeNumber);
router.get('/all', requirePermission(HR_PERMISSIONS.SHIFT_CHG), shiftController.getAllSchangeApplications);
router.get('/pending', requirePermission(HR_PERMISSIONS.SHIFT_CHG_APPROVE), shiftController.getPendingShiftChanges);
router.post('/approve', requirePermission(HR_PERMISSIONS.SHIFT_CHG_APPROVE), shiftController.approveShiftChange);
router.post('/cancel', requirePermission(HR_PERMISSIONS.SHIFT_CHG_APPROVE), shiftController.cancelShiftChange);
router.post('/reopen', requirePermission(HR_PERMISSIONS.SHIFT_CHG_APPROVE), shiftController.reopenShiftChange);
router.get('/master/all', requirePermission(HR_PERMISSIONS.SHIFT_MASTER), shiftController.getAllShifts);
router.post('/master/save', requirePermission(HR_PERMISSIONS.SHIFT_MASTER), shiftController.saveShift);
router.delete('/master/:shift_id', requirePermission(HR_PERMISSIONS.SHIFT_MASTER), shiftController.deleteShift);
router.get('/master/next-id', shiftController.getNextShiftId);
router.get('/schedule/all', requirePermission(HR_PERMISSIONS.SHIFT_SCHED), shiftController.getAllSchedules);
router.post('/schedule/save', requirePermission(HR_PERMISSIONS.SHIFT_SCHED), shiftController.saveSchedule);
router.post('/schedule/save-bulk', requirePermission(HR_PERMISSIONS.SHIFT_SCHED), shiftController.saveBulkSchedules);
router.delete('/schedule/:id', requirePermission(HR_PERMISSIONS.SHIFT_SCHED), shiftController.deleteSchedule);
router.post('/generate-monthly', requirePermission(HR_PERMISSIONS.SHIFT_SCHED), shiftController.generateMonthlyData);
router.get('/schedule/by-date', shiftController.getShiftByEmpAndDate);
router.get('/change-report', requirePermission(HR_PERMISSIONS.REPORTS), shiftController.getShiftChangeReport);
router.get('/woff-report', requirePermission(HR_PERMISSIONS.REPORTS), shiftController.getWoffChangeReport);

module.exports = router;
