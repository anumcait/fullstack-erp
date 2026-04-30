const express = require('express');
const router = express.Router();
const { hrSummary, employeeSummary, managerSummary } = require('../../controllers/HR/dashboardController');

const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.status(401).json({ message: 'Not logged in' });
};

//router.get('/hr-summary', isAuthenticated, hrSummary);
router.get('/hr-summary',  hrSummary);
router.get('/manager-summary', isAuthenticated, managerSummary);
// Temporarily disabled auth to debug - empid from query param
router.get('/employee-summary', employeeSummary);

module.exports = router;
