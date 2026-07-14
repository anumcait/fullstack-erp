const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/HR/attendanceCollectorController');

router.get('/punches', ctrl.getPunches);
router.get('/batches', ctrl.getBatches);

router.post('/import-csv', ctrl.upload, ctrl.importCsv);
router.post('/push', ctrl.pushPunch);
router.post('/bulk-push', ctrl.bulkPushPunches);
router.post('/manual', ctrl.manualPunch);
router.post('/process', ctrl.processPunches);

module.exports = router;
