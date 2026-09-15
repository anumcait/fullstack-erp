const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const holidayController = require('../../controllers/HR/holidayController');

router.get('/', holidayController.getAllHolidays);
router.post('/save', requirePermission(HR_PERMISSIONS.HOLIDAY_MASTER), holidayController.saveHoliday);
router.post('/save-bulk', requirePermission(HR_PERMISSIONS.HOLIDAY_MASTER), holidayController.saveBulkHolidays);
router.delete('/:hno', requirePermission(HR_PERMISSIONS.HOLIDAY_MASTER), holidayController.deleteHoliday);
router.get('/check', holidayController.getHolidayForDate);
router.get('/next-id', holidayController.getNextHno);

module.exports = router;
