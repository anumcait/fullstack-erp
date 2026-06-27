const express = require('express');
const router = express.Router();
const { login, logout, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/test', (req, res) => res.send('Auth API is online'));

module.exports = router;