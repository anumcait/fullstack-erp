const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const incrementController = require('../../controllers/HR/incrementController');

router.get('/', requirePermission(HR_PERMISSIONS.INCR), incrementController.getAllIncrements);
router.get('/components', requirePermission(HR_PERMISSIONS.INCR), incrementController.getComponents);
router.get('/next-id', requirePermission(HR_PERMISSIONS.INCR), incrementController.getNextId);
router.get('/form-data', requirePermission(HR_PERMISSIONS.INCR), incrementController.getFormData);
router.get('/employee/:empid', requirePermission(HR_PERMISSIONS.INCR), incrementController.getByEmployee);
router.get('/employee/:empid/salary-history', requirePermission(HR_PERMISSIONS.INCR), incrementController.getSalaryHistory);

router.post('/apply', requirePermission(HR_PERMISSIONS.INCR), incrementController.createIncrement);
router.put('/:increment_id', requirePermission(HR_PERMISSIONS.INCR), incrementController.updateIncrement);
router.post('/approve', requirePermission(HR_PERMISSIONS.INCR_APPROVE), incrementController.approveIncrement);
router.post('/reject', requirePermission(HR_PERMISSIONS.INCR_APPROVE), incrementController.rejectIncrement);

module.exports = router;