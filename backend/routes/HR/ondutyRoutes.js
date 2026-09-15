const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const ondutyController = require('../../controllers/HR/ondutyController');

router.post('/save', requirePermission(HR_PERMISSIONS.ONDUTY), ondutyController.saveOnDuty);
router.get('/next-id', ondutyController.getNextOnDutyNumber);
router.get('/all', requirePermission(HR_PERMISSIONS.ONDUTY), ondutyController.getAllOnDutyApplications);
router.get('/pending', requirePermission(HR_PERMISSIONS.ONDUTY_APPROVE), ondutyController.getPendingOnDuty);
router.post('/approve', requirePermission(HR_PERMISSIONS.ONDUTY_APPROVE), ondutyController.approveOnDuty);
router.post('/cancel', requirePermission(HR_PERMISSIONS.ONDUTY_APPROVE), ondutyController.cancelOnDuty);
router.post('/reopen', requirePermission(HR_PERMISSIONS.ONDUTY_APPROVE), ondutyController.reopenOnDuty);

module.exports = router;
