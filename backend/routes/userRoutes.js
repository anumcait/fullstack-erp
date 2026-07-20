const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Get all users for the rights management dropdown
router.get('/', userController.getAllUsers);

// Update permissions for a specific user (admin only)
router.put('/:id/permissions', requireAuth, requireRole(['ADMIN']), userController.updatePermissions);

module.exports = router;
