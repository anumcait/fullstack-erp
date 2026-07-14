const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/HR/recruitmentController');

// Dashboard
router.get('/dashboard', ctrl.getDashboard);

// Job Requisition
router.get('/requisitions', ctrl.getAllRequisitions);
router.get('/requisitions/:id', ctrl.getRequisition);
router.post('/requisitions', ctrl.saveRequisition);
router.post('/requisitions/approve', ctrl.approveRequisition);

// Candidate
router.get('/candidates', ctrl.getAllCandidates);
router.post('/candidates', ctrl.saveCandidate);
router.post('/candidates/status', ctrl.updateCandidateStatus);

// Interview
router.get('/interviews', ctrl.getInterviews);
router.post('/interviews', ctrl.saveInterview);

// Offer Letter
router.get('/offers', ctrl.getAllOffers);
router.post('/offers', ctrl.saveOffer);
router.post('/offers/status', ctrl.updateOfferStatus);

module.exports = router;
