const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const employeeController = require('../../controllers/HR/employeeController');
const profileRequestController = require('../../controllers/HR/profileRequestController');

router.get('/', requirePermission(HR_PERMISSIONS.EMP_MASTER), employeeController.getAllEmployees);

// Employee self-service profile (must be before /:empid to avoid route conflict)
router.get('/me/profile', employeeController.getProfile);
router.put('/me/profile', employeeController.updateProfile);

// Profile update request routes
router.post('/profile-request', profileRequestController.submitRequest);
router.get('/profile-requests', requirePermission(HR_PERMISSIONS.PROFILE_APPROVE), profileRequestController.getPendingRequests);
router.get('/my-profile-requests', profileRequestController.getMyRequests);
router.put('/profile-requests/:id/approve', requirePermission(HR_PERMISSIONS.PROFILE_APPROVE), profileRequestController.approveRequest);
router.put('/profile-requests/:id/reject', requirePermission(HR_PERMISSIONS.PROFILE_APPROVE), profileRequestController.rejectRequest);
router.post('/add-employee', requirePermission(HR_PERMISSIONS.ADD_EMP), employeeController.createEmployee);
router.post('/bulk-update-salaries', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), upload.single('file'), employeeController.bulkUpdateSalaries);
router.get('/photos', requirePermission(HR_PERMISSIONS.PHOTO), employeeController.getPhotos);
router.get('/:empid', requirePermission(HR_PERMISSIONS.EMP_MASTER), employeeController.getEmployeeById);
router.get('/:empid/full', requirePermission(HR_PERMISSIONS.EMP_MASTER), employeeController.getEmployeeFullDetails);
router.put('/:empid', requirePermission(HR_PERMISSIONS.ADD_EMP), employeeController.updateEmployee);
router.delete('/:empid', requirePermission(HR_PERMISSIONS.ADD_EMP), employeeController.deleteEmployee);
router.get('/:empid/photo', employeeController.getPhoto);
router.put('/:empid/photo', requirePermission(HR_PERMISSIONS.PHOTO), employeeController.uploadPhoto);
router.delete('/:empid/photo', requirePermission(HR_PERMISSIONS.PHOTO), employeeController.deletePhoto);

module.exports = router;
