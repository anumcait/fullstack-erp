const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/HR/exitSettlementController');

router.get('/dashboard', ctrl.getExitDashboard);

// Exit Application
router.get('/exits', ctrl.getAllExits);
router.get('/exits/:id', ctrl.getExit);
router.post('/exits', ctrl.saveExitApplication);
router.post('/exits/approve', ctrl.approveExit);

// Clearance
router.get('/clearance', ctrl.getClearance);
router.post('/clearance', ctrl.updateClearance);

// Settlement
router.get('/settlement', ctrl.getSettlement);
router.post('/settlement', ctrl.saveSettlement);
router.post('/settlement/calculate', ctrl.calculateSettlement);
router.post('/settlement/approve', ctrl.approveSettlement);

module.exports = router;
