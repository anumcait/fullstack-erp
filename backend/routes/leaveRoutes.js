const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

router.post('/apply', leaveController.applyLeave);
router.get('/next-lno',leaveController.getNextLeaveNumber);
router.get('/report',leaveController.getAllLeaves);
router.post('/master/save',leaveController.saveLeaveMaster);
router.get('/balance/:empid',leaveController.balanceLeaves);
router.post('/approve',leaveController.approveLeave);
router.get('/pendingleaves', leaveController.getPendingLeaveApplications);



module.exports = router;