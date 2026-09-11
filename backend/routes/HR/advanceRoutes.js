const express = require('express');
const router = express.Router();
const advanceController = require('../../controllers/HR/advanceController');

router.post('/save', advanceController.saveAdvance);
router.get('/next-id', advanceController.getNextAdvanceNumber);
router.get('/all', advanceController.getAllAdvanceApplications);
router.get('/pending', advanceController.getPendingAdvances);
router.post('/approve', advanceController.approveAdvance);
router.post('/cancel', advanceController.cancelAdvance);
router.post('/reopen', advanceController.reopenAdvance);
router.post('/edit-schedule', advanceController.editSchedule);
router.get('/report', advanceController.getAdvanceReport);

module.exports = router;
