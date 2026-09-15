const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const ctrl = require('../../controllers/HR/exitSettlementController');

router.get('/dashboard', requirePermission(HR_PERMISSIONS.EXIT), ctrl.getExitDashboard);
router.get('/exits', requirePermission(HR_PERMISSIONS.EXIT), ctrl.getAllExits);
router.get('/exits/:id', requirePermission(HR_PERMISSIONS.EXIT), ctrl.getExit);
router.post('/exits', requirePermission(HR_PERMISSIONS.EXIT), ctrl.saveExitApplication);
router.post('/exits/approve', requirePermission(HR_PERMISSIONS.EXIT), ctrl.approveExit);
router.get('/clearance', requirePermission(HR_PERMISSIONS.EXIT), ctrl.getClearance);
router.post('/clearance', requirePermission(HR_PERMISSIONS.EXIT), ctrl.updateClearance);
router.get('/settlement', requirePermission(HR_PERMISSIONS.EXIT), ctrl.getSettlement);
router.post('/settlement', requirePermission(HR_PERMISSIONS.EXIT), ctrl.saveSettlement);
router.post('/settlement/calculate', requirePermission(HR_PERMISSIONS.EXIT), ctrl.calculateSettlement);
router.post('/settlement/approve', requirePermission(HR_PERMISSIONS.EXIT), ctrl.approveSettlement);

module.exports = router;
