const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const tc = require('../../controllers/HR/employeeTaxController');

const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.status(401).json({ message: 'Not logged in' });
};

router.get('/regime', isAuthenticated, tc.getRegime);
router.post('/regime', isAuthenticated, tc.setRegime);
router.get('/investments', isAuthenticated, tc.getInvestments);
router.post('/investments', isAuthenticated, tc.saveInvestments);
router.post('/compute', requirePermission(HR_PERMISSIONS.TAX), tc.computeTax);
router.get('/computation', isAuthenticated, tc.getComputation);
router.get('/sections', isAuthenticated, tc.getSections);

module.exports = router;
