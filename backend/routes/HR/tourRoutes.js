const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const tourController = require('../../controllers/HR/tourController');

router.get('/all', requirePermission(HR_PERMISSIONS.TOUR), tourController.getAllTours);
router.get('/next-id', tourController.getNextTourId);
router.get('/pending', requirePermission(HR_PERMISSIONS.TOUR_APPROVE), tourController.getPendingTours);
router.get('/report', requirePermission(HR_PERMISSIONS.REPORTS), tourController.getTourReport);
router.get('/:id', requirePermission(HR_PERMISSIONS.TOUR), tourController.getTourById);
router.post('/apply', requirePermission(HR_PERMISSIONS.TOUR), tourController.createTour);
router.put('/:id', requirePermission(HR_PERMISSIONS.TOUR), tourController.updateTour);
router.delete('/:id', requirePermission(HR_PERMISSIONS.TOUR), tourController.deleteTour);
router.put('/approve/:id', requirePermission(HR_PERMISSIONS.TOUR_APPROVE), tourController.approveTour);
router.post('/cancel', requirePermission(HR_PERMISSIONS.TOUR_APPROVE), tourController.cancelTour);
router.post('/reopen', requirePermission(HR_PERMISSIONS.TOUR_APPROVE), tourController.reopenTour);

module.exports = router;
