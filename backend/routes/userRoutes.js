const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Get all users for the rights management dropdown
router.get('/', userController.getAllUsers);

// Update permissions for a specific user
router.put('/:id/permissions', userController.updatePermissions);

module.exports = router;
