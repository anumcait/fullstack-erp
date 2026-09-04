const express = require('express');
const router = express.Router();
const payrollController = require('../../controllers/HR/payrollController');
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');

// Every payroll endpoint requires the HR_PAYROLL_PROC permission. ADMIN still
// bypasses (see middleware/auth.js). This enforces the same permission the
// frontend uses, so removing it from a user blocks both UI and API access.
router.post('/process', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.processMonthlySalary);
router.post('/create', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.createPayslipByEmployee);
router.get('/register', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.getSalaryRegister);
router.get('/payslip', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.getEmployeePayslip);
router.get('/years', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.getYearsWithSalary);
router.get('/employees', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.getAllEmployees);
router.get('/salary-details', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.getSalaryDetails);
router.post('/salary-details', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.saveSalaryDetails);
router.get('/check-status', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.checkPayslipStatus);
router.get('/latest-processed', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.getLatestProcessedDate);
router.post('/finalize', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.finalizeSalary);
router.get('/finalize-status', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.getFinalizeStatus);
router.get('/pf-report', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.getPfReport);
router.get('/pt-report', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.getPtReport);
router.get('/earnings-deductions', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.getEarningsDeductions);
router.get('/meals-coupon', requirePermission(HR_PERMISSIONS.PAYROLL_PROC), payrollController.getMealsCoupon);
router.get('/my-payslips', payrollController.getMyPayslips);
router.get('/my-payslip/download', payrollController.downloadMyPayslip);

module.exports = router;
