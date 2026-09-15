const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const esiLeaveController = require('../../controllers/HR/esiLeaveController');

router.post('/save', requirePermission(HR_PERMISSIONS.ESI_LEAVE), esiLeaveController.saveESILeave);
router.get('/next-id', esiLeaveController.getNextESILeaveNumber);
router.get('/all', requirePermission(HR_PERMISSIONS.ESI_LEAVE), esiLeaveController.getAllESILeaveApplications);
router.get('/pending', requirePermission(HR_PERMISSIONS.ESI_LEAVE), esiLeaveController.getPendingESILeaves);
router.post('/approve', requirePermission(HR_PERMISSIONS.ESI_LEAVE), esiLeaveController.approveESILeave);
router.post('/cancel', requirePermission(HR_PERMISSIONS.ESI_LEAVE), esiLeaveController.cancelESILeave);
router.post('/reopen', requirePermission(HR_PERMISSIONS.ESI_LEAVE), esiLeaveController.reopenESILeave);

module.exports = router;
