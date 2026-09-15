const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const advanceController = require('../../controllers/HR/advanceController');

router.post('/save', requirePermission(HR_PERMISSIONS.ADVANCE), advanceController.saveAdvance);
router.get('/next-id', advanceController.getNextAdvanceNumber);
router.get('/all', requirePermission(HR_PERMISSIONS.ADVANCE), advanceController.getAllAdvanceApplications);
router.get('/pending', requirePermission(HR_PERMISSIONS.ADVANCE), advanceController.getPendingAdvances);
router.post('/approve', requirePermission(HR_PERMISSIONS.ADVANCE), advanceController.approveAdvance);
router.post('/cancel', requirePermission(HR_PERMISSIONS.ADVANCE), advanceController.cancelAdvance);
router.post('/reopen', requirePermission(HR_PERMISSIONS.ADVANCE), advanceController.reopenAdvance);
router.post('/edit-schedule', requirePermission(HR_PERMISSIONS.ADVANCE), advanceController.editSchedule);
router.get('/report', requirePermission(HR_PERMISSIONS.REPORTS), advanceController.getAdvanceReport);

module.exports = router;
