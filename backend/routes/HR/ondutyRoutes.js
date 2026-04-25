const express = require('express');
const router = express.Router();
const ondutyController = require('../../controllers/HR/ondutyController');

router.post('/save', ondutyController.saveOnDuty);
router.get('/next-id', ondutyController.getNextOnDutyNumber);
router.get('/all', ondutyController.getAllOnDutyApplications);
router.get('/pending', ondutyController.getPendingOnDuty);
router.post('/approve', ondutyController.approveOnDuty);

module.exports = router;
