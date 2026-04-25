const express = require('express');
const router = express.Router();
const holidayController = require('../../controllers/HR/holidayController');

router.get('/', holidayController.getAllHolidays);
router.post('/save', holidayController.saveHoliday);
router.post('/save-bulk', holidayController.saveBulkHolidays);
router.delete('/:hno', holidayController.deleteHoliday);
router.get('/check', holidayController.getHolidayForDate);
router.get('/next-id', holidayController.getNextHno);

module.exports = router;
