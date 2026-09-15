const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const extOtController = require('../../controllers/HR/extOtController');

router.get('/all', requirePermission(HR_PERMISSIONS.OT_APP), extOtController.getAll);
router.get('/:id', requirePermission(HR_PERMISSIONS.OT_APP), extOtController.getById);
router.post('/', requirePermission(HR_PERMISSIONS.ATTENDANCE_REQUEST), extOtController.create);
router.put('/:id', requirePermission(HR_PERMISSIONS.ATTENDANCE_REQUEST), extOtController.update);
router.delete('/:id', requirePermission(HR_PERMISSIONS.ATTENDANCE_REQUEST), extOtController.delete);
router.put('/manager-approve/:id', requirePermission(HR_PERMISSIONS.ATTENDANCE_APPROVE), extOtController.managerApprove);
router.put('/hr-approve/:id', requirePermission(HR_PERMISSIONS.OT_APP), extOtController.hrApprove);
router.put('/hr-update/:id', requirePermission(HR_PERMISSIONS.OT_APP), extOtController.hrUpdate);
router.post('/manager-bulk-approve', requirePermission(HR_PERMISSIONS.ATTENDANCE_APPROVE), extOtController.managerBulkApprove);
router.post('/hr-bulk-approve', requirePermission(HR_PERMISSIONS.OT_APP), extOtController.hrBulkApprove);

module.exports = router;
