const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead } = require('../../controllers/HR/notificationController');

const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.status(401).json({ message: 'Not logged in' });
};

router.get('/', isAuthenticated, getNotifications);
router.put('/:id/read', isAuthenticated, markAsRead);
router.post('/read-all', isAuthenticated, markAllAsRead);

module.exports = router;
