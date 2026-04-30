const express = require('express');
const router = express.Router();
const leaveController = require('../../controllers/HR/leaveController');

router.post('/apply', leaveController.applyLeave);
router.get('/next-lno', leaveController.getNextLeaveNumber);
router.get('/report', leaveController.getAllLeaves);
router.post('/master/save', leaveController.saveLeaveMaster);
router.get('/balance/:empid', leaveController.balanceLeaves);
router.post('/approve', leaveController.approveLeave);
router.get('/pendingleaves', leaveController.getPendingLeaveApplications);
router.get('/check-overlap', leaveController.checkLeaveOverlap);

router.get('/:lno', leaveController.getLeaveApp);



module.exports = router;
