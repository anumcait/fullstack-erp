const express = require('express');
const router = express.Router();
const advanceController = require('../../controllers/HR/advanceController');

router.post('/save', advanceController.saveAdvance);
router.get('/next-id', advanceController.getNextAdvanceNumber);
router.get('/all', advanceController.getAllAdvanceApplications);
router.get('/pending', advanceController.getPendingAdvances);
router.post('/approve', advanceController.approveAdvance);
router.get('/report', advanceController.getAdvanceReport);

module.exports = router;
