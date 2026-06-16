const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/HR/settingsController');

router.get('/company', settingsController.getCompanySettings);
router.post('/company', settingsController.updateCompanySettings);

module.exports = router;
