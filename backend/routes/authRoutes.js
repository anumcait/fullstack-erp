const express = require('express');
const router = express.Router();
const { login, logout, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);
router.post('/change-password', changePassword);
router.get('/test', (req, res) => res.send('Auth API is online'));

module.exports = router;