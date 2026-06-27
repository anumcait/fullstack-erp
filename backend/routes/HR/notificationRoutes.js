const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../../controllers/HR/notificationController');

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);

module.exports = router;
