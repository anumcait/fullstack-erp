const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/HR/pmsController');

router.get('/dashboard', ctrl.getPmsDashboard);

// KRA Templates
router.get('/templates', ctrl.getAllTemplates);
router.get('/templates/:id', ctrl.getTemplate);
router.post('/templates', ctrl.saveTemplate);

// Appraisal Cycles
router.get('/cycles', ctrl.getAllCycles);
router.post('/cycles', ctrl.saveCycle);

// Appraisals
router.get('/appraisals', ctrl.getAllAppraisals);
router.get('/appraisals/:id', ctrl.getAppraisal);
router.post('/appraisals', ctrl.saveAppraisal);
router.post('/appraisals/submit', ctrl.submitAppraisal);
router.post('/appraisals/approve', ctrl.approveAppraisal);
router.post('/appraisals/bulk-initiate', ctrl.bulkInitiateAppraisals);

module.exports = router;
