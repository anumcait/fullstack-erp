const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const woffController = require('../../controllers/HR/woffController');

router.get('/all', requirePermission(HR_PERMISSIONS.WOFF_CHG), woffController.getAllWoffs);
router.get('/next-id', woffController.getNextWoffId);
router.get('/:id', requirePermission(HR_PERMISSIONS.WOFF_CHG), woffController.getWoffById);
router.post('/apply', requirePermission(HR_PERMISSIONS.WOFF_CHG), woffController.createWoff);
router.put('/:id', requirePermission(HR_PERMISSIONS.WOFF_CHG), woffController.updateWoff);
router.delete('/:id', requirePermission(HR_PERMISSIONS.WOFF_CHG), woffController.deleteWoff);
router.put('/approve/:id', requirePermission(HR_PERMISSIONS.WOFF_CHG_APPROVE), woffController.approveWoff);
router.get('/pending', requirePermission(HR_PERMISSIONS.WOFF_CHG_APPROVE), woffController.getPendingWoffChanges);
router.post('/approve', requirePermission(HR_PERMISSIONS.WOFF_CHG_APPROVE), woffController.approveWoffChange);
router.post('/cancel', requirePermission(HR_PERMISSIONS.WOFF_CHG_APPROVE), woffController.cancelWoff);
router.post('/reopen', requirePermission(HR_PERMISSIONS.WOFF_CHG_APPROVE), woffController.reopenWoff);

module.exports = router;
