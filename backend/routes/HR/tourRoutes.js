const express = require('express');
const router = express.Router();
const tourController = require('../../controllers/HR/tourController');

router.get('/all', tourController.getAllTours);
router.get('/next-id', tourController.getNextTourId);
router.get('/:id', tourController.getTourById);
router.post('/apply', tourController.createTour);
router.put('/:id', tourController.updateTour);
router.delete('/:id', tourController.deleteTour);
router.put('/approve/:id', tourController.approveTour);
router.post('/cancel', tourController.cancelTour);
router.post('/reopen', tourController.reopenTour);
router.get('/pending', tourController.getPendingTours);
router.get('/report', tourController.getTourReport);

module.exports = router;
