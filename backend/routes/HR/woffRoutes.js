const express = require('express');
const router = express.Router();
const woffController = require('../../controllers/HR/woffController');

router.get('/all', woffController.getAllWoffs);
router.get('/next-id', woffController.getNextWoffId);
router.get('/:id', woffController.getWoffById);
router.post('/apply', woffController.createWoff);
router.put('/:id', woffController.updateWoff);
router.delete('/:id', woffController.deleteWoff);
router.put('/approve/:id', woffController.approveWoff);
router.get('/pending', woffController.getPendingWoffChanges);
router.post('/approve', woffController.approveWoffChange);

module.exports = router;
