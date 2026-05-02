const express = require('express');
const router = express.Router();
const shiftController = require('../../controllers/HR/shiftController');

// Shift Change Application Routes
router.post('/save', shiftController.saveSChange);
router.get('/next-id', shiftController.getNextSchangeNumber);
router.get('/all', shiftController.getAllSchangeApplications);
router.get('/pending', shiftController.getPendingShiftChanges);
router.post('/approve', shiftController.approveShiftChange);
router.post('/cancel', shiftController.cancelShiftChange);
router.post('/reopen', shiftController.reopenShiftChange);

// Shift Master Routes
router.get('/master/all', shiftController.getAllShifts);
router.post('/master/save', shiftController.saveShift);
router.delete('/master/:shift_id', shiftController.deleteShift);
router.get('/master/next-id', shiftController.getNextShiftId);

// Shift Schedule Routes
router.get('/schedule/all', shiftController.getAllSchedules);
router.post('/schedule/save', shiftController.saveSchedule);
router.post('/schedule/save-bulk', shiftController.saveBulkSchedules);
router.delete('/schedule/:id', shiftController.deleteSchedule);
router.post('/generate-monthly', shiftController.generateMonthlyData);

// Report Routes
router.get('/change-report', shiftController.getShiftChangeReport);
router.get('/woff-report', shiftController.getWoffChangeReport);

module.exports = router;
