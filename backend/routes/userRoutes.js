const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Get all users for the rights management dropdown
router.get('/', userController.getAllUsers);

// Create a new user (system user for non-employees OR employee linked user)
router.post('/create', requireAuth, requireRole(['ADMIN']), userController.createUser);

// Update permissions for a specific user (admin only)
router.put('/:id/permissions', requireAuth, requireRole(['ADMIN']), userController.updatePermissions);

// Update username / display name / role (admin only)
router.put('/:id', requireAuth, requireRole(['ADMIN']), userController.updateUser);

module.exports = router;
