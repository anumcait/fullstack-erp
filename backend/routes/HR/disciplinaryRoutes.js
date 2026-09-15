const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const ctrl = require('../../controllers/HR/disciplinaryController');

router.get('/dashboard', requirePermission(HR_PERMISSIONS.DISCIPLINARY), ctrl.getDashboard);
router.get('/cases', requirePermission(HR_PERMISSIONS.DISCIPLINARY), ctrl.getAllCases);
router.get('/cases/:id', requirePermission(HR_PERMISSIONS.DISCIPLINARY), ctrl.getCase);
router.post('/cases', requirePermission(HR_PERMISSIONS.DISCIPLINARY), ctrl.saveCase);
router.post('/cases/status', requirePermission(HR_PERMISSIONS.DISCIPLINARY), ctrl.updateCaseStatus);
router.post('/show-cause', requirePermission(HR_PERMISSIONS.DISCIPLINARY), ctrl.saveShowCause);
router.post('/show-cause/respond', requirePermission(HR_PERMISSIONS.DISCIPLINARY), ctrl.respondShowCause);
router.post('/actions', requirePermission(HR_PERMISSIONS.DISCIPLINARY), ctrl.saveAction);

module.exports = router;
