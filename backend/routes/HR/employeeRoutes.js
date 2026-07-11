const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const employeeController = require('../../controllers/HR/employeeController');
const profileRequestController = require('../../controllers/HR/profileRequestController');

// Get all employees
router.get('/', employeeController.getAllEmployees);

// Employee self-service profile (must be before /:empid to avoid route conflict)
router.get('/me/profile', employeeController.getProfile);
router.put('/me/profile', employeeController.updateProfile);

// Profile update request routes
router.post('/profile-request', profileRequestController.submitRequest);
router.get('/profile-requests', profileRequestController.getPendingRequests);
router.get('/my-profile-requests', profileRequestController.getMyRequests);
router.put('/profile-requests/:id/approve', profileRequestController.approveRequest);
router.put('/profile-requests/:id/reject', profileRequestController.rejectRequest);

// Create new employee
router.post('/add-employee', employeeController.createEmployee);

// Bulk update salaries from CSV
router.post('/bulk-update-salaries', upload.single('file'), employeeController.bulkUpdateSalaries);

// Bulk photos (must be before /:empid to avoid route conflict)
router.get('/photos', employeeController.getPhotos);

// Get employee by ID
router.get('/:empid', employeeController.getEmployeeById);
router.get('/:empid/full', employeeController.getEmployeeFullDetails);

// Update employee by ID
router.put('/:empid', employeeController.updateEmployee);

// Delete employee by ID
router.delete('/:empid', employeeController.deleteEmployee);

// Photo management
router.get('/photos', employeeController.getPhotos);
router.get('/:empid/photo', employeeController.getPhoto);
router.put('/:empid/photo', employeeController.uploadPhoto);
router.delete('/:empid/photo', employeeController.deletePhoto);

module.exports = router;
