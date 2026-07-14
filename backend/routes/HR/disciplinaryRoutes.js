const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/HR/disciplinaryController');

router.get('/dashboard', ctrl.getDashboard);

router.get('/cases', ctrl.getAllCases);
router.get('/cases/:id', ctrl.getCase);
router.post('/cases', ctrl.saveCase);
router.post('/cases/status', ctrl.updateCaseStatus);

router.post('/show-cause', ctrl.saveShowCause);
router.post('/show-cause/respond', ctrl.respondShowCause);

router.post('/actions', ctrl.saveAction);

module.exports = router;
