const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const ctrl = require('../../controllers/HR/pfAccountingController');

router.get('/ledger', requirePermission(HR_PERMISSIONS.PF_ACCOUNTING), ctrl.getLedger);
router.post('/ledger', requirePermission(HR_PERMISSIONS.PF_ACCOUNTING), ctrl.saveLedgerEntry);
router.post('/generate', requirePermission(HR_PERMISSIONS.PF_ACCOUNTING), ctrl.generatePf);
router.get('/challans', requirePermission(HR_PERMISSIONS.PF_ACCOUNTING), ctrl.getChallans);
router.post('/challans', requirePermission(HR_PERMISSIONS.PF_ACCOUNTING), ctrl.generateChallan);
router.post('/challans/update', requirePermission(HR_PERMISSIONS.PF_ACCOUNTING), ctrl.updateChallan);
router.get('/report', requirePermission(HR_PERMISSIONS.PF_ACCOUNTING), ctrl.getReport);

module.exports = router;
