const express = require('express');
const router = express.Router();
const payrollController = require('../../controllers/HR/payrollController');

router.post('/process', payrollController.processMonthlySalary);
router.post('/create', payrollController.createPayslipByEmployee);
router.get('/register', payrollController.getSalaryRegister);
router.get('/payslip', payrollController.getEmployeePayslip);
router.get('/years', payrollController.getYearsWithSalary);
router.get('/employees', payrollController.getAllEmployees);
router.get('/salary-details', payrollController.getSalaryDetails);
router.post('/salary-details', payrollController.saveSalaryDetails);
router.get('/check-status', payrollController.checkPayslipStatus);
router.get('/latest-processed', payrollController.getLatestProcessedDate);
router.post('/finalize', payrollController.finalizeSalary);
router.get('/finalize-status', payrollController.getFinalizeStatus);

module.exports = router;
