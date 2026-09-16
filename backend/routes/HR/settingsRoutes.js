const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const settingsController = require('../../controllers/HR/settingsController');

const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.status(401).json({ message: 'Not logged in' });
};

router.get('/company', settingsController.getCompanySettings);
router.post('/company', isAuthenticated, requirePermission(HR_PERMISSIONS.SETTINGS), settingsController.updateCompanySettings);

module.exports = router;
