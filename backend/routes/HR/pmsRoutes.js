const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const ctrl = require('../../controllers/HR/pmsController');

router.get('/dashboard', requirePermission(HR_PERMISSIONS.PMS), ctrl.getPmsDashboard);
router.get('/templates', requirePermission(HR_PERMISSIONS.PMS), ctrl.getAllTemplates);
router.get('/templates/:id', requirePermission(HR_PERMISSIONS.PMS), ctrl.getTemplate);
router.post('/templates', requirePermission(HR_PERMISSIONS.PMS), ctrl.saveTemplate);
router.get('/cycles', requirePermission(HR_PERMISSIONS.PMS), ctrl.getAllCycles);
router.post('/cycles', requirePermission(HR_PERMISSIONS.PMS), ctrl.saveCycle);
router.get('/appraisals', requirePermission(HR_PERMISSIONS.PMS), ctrl.getAllAppraisals);
router.get('/appraisals/:id', requirePermission(HR_PERMISSIONS.PMS), ctrl.getAppraisal);
router.post('/appraisals', requirePermission(HR_PERMISSIONS.PMS), ctrl.saveAppraisal);
router.post('/appraisals/submit', requirePermission(HR_PERMISSIONS.PMS), ctrl.submitAppraisal);
router.post('/appraisals/approve', requirePermission(HR_PERMISSIONS.PMS), ctrl.approveAppraisal);
router.post('/appraisals/bulk-initiate', requirePermission(HR_PERMISSIONS.PMS), ctrl.bulkInitiateAppraisals);

module.exports = router;
