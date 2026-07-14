const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/HR/pfAccountingController');

router.get('/ledger', ctrl.getLedger);
router.post('/ledger', ctrl.saveLedgerEntry);
router.post('/generate', ctrl.generatePf);

router.get('/challans', ctrl.getChallans);
router.post('/challans', ctrl.generateChallan);
router.post('/challans/update', ctrl.updateChallan);

router.get('/report', ctrl.getReport);

module.exports = router;
