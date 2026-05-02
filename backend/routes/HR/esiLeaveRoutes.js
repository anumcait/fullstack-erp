const express = require('express');
const router = express.Router();
const esiLeaveController = require('../../controllers/HR/esiLeaveController');

router.post('/save', esiLeaveController.saveESILeave);
router.get('/next-id', esiLeaveController.getNextESILeaveNumber);
router.get('/all', esiLeaveController.getAllESILeaveApplications);
router.get('/pending', esiLeaveController.getPendingESILeaves);
router.post('/approve', esiLeaveController.approveESILeave);
router.post('/cancel', esiLeaveController.cancelESILeave);
router.post('/reopen', esiLeaveController.reopenESILeave);

module.exports = router;
