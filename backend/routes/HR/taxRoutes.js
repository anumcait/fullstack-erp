const express = require('express');
const router = express.Router();
const tc = require('../../controllers/HR/employeeTaxController');

router.get('/regime', tc.getRegime);
router.post('/regime', tc.setRegime);
router.get('/investments', tc.getInvestments);
router.post('/investments', tc.saveInvestments);
router.post('/compute', tc.computeTax);
router.get('/computation', tc.getComputation);
router.get('/sections', tc.getSections);

module.exports = router;
