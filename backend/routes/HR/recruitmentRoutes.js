const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const ctrl = require('../../controllers/HR/recruitmentController');

router.get('/dashboard', requirePermission(HR_PERMISSIONS.RECRUITMENT), ctrl.getDashboard);
router.get('/requisitions', requirePermission(HR_PERMISSIONS.RECRUITMENT), ctrl.getAllRequisitions);
router.get('/requisitions/:id', requirePermission(HR_PERMISSIONS.RECRUITMENT), ctrl.getRequisition);
router.post('/requisitions', requirePermission(HR_PERMISSIONS.RECRUITMENT), ctrl.saveRequisition);
router.post('/requisitions/approve', requirePermission(HR_PERMISSIONS.RECRUITMENT), ctrl.approveRequisition);

router.get('/candidates', requirePermission(HR_PERMISSIONS.RECRUITMENT), ctrl.getAllCandidates);
router.post('/candidates', requirePermission(HR_PERMISSIONS.RECRUITMENT), ctrl.saveCandidate);
router.post('/candidates/status', requirePermission(HR_PERMISSIONS.RECRUITMENT), ctrl.updateCandidateStatus);
router.get('/interviews', requirePermission(HR_PERMISSIONS.RECRUITMENT), ctrl.getInterviews);
router.post('/interviews', requirePermission(HR_PERMISSIONS.RECRUITMENT), ctrl.saveInterview);
router.get('/offers', requirePermission(HR_PERMISSIONS.RECRUITMENT), ctrl.getAllOffers);
router.post('/offers', requirePermission(HR_PERMISSIONS.RECRUITMENT), ctrl.saveOffer);
router.post('/offers/status', requirePermission(HR_PERMISSIONS.RECRUITMENT), ctrl.updateOfferStatus);

module.exports = router;
