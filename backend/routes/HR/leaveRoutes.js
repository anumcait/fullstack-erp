const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const leaveController = require('../../controllers/HR/leaveController');

router.post('/apply', requirePermission(HR_PERMISSIONS.LEAVE_APP), leaveController.applyLeave);
router.get('/next-lno', leaveController.getNextLeaveNumber);
router.get('/report', requirePermission(HR_PERMISSIONS.REPORTS), leaveController.getAllLeaves);
router.post('/master/save', requirePermission(HR_PERMISSIONS.LEAVE_MASTER), leaveController.saveLeaveMaster);
router.get('/balance/:empid', leaveController.balanceLeaves);
router.post('/approve', requirePermission(HR_PERMISSIONS.LEAVE_APPROVE), leaveController.approveLeave);
router.post('/reject', requirePermission(HR_PERMISSIONS.LEAVE_APPROVE), leaveController.rejectLeave);
router.post('/cancel-approval', requirePermission(HR_PERMISSIONS.LEAVE_APPROVE), leaveController.cancelApproval);
router.post('/cancel-partial', requirePermission(HR_PERMISSIONS.LEAVE_APPROVE), leaveController.cancelPartialApproval);
router.post('/reopen', requirePermission(HR_PERMISSIONS.LEAVE_APPROVE), leaveController.reopenLeave);
router.get('/pendingleaves', requirePermission(HR_PERMISSIONS.LEAVE_APPROVE), leaveController.getPendingLeaveApplications);
router.get('/all-leaves', requirePermission(HR_PERMISSIONS.LEAVE_APP), leaveController.getAllLeaveApplications);
router.post('/check-overlap', requirePermission(HR_PERMISSIONS.LEAVE_APP), leaveController.checkLeaveOverlap);

router.get('/:lno', leaveController.getLeaveApp);



module.exports = router;
