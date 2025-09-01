const { employee_master,User } = require('../models');
const bcrypt = require('bcrypt');

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await employee_master.findAll();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getEmployeeById = async (req, res) => {
  const { empid } = req.params;
  try {
    const employee = await employee_master.findOne({ where: { empid } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





exports.createEmployee = async (req, res) => {
  const { personal, commAddress, permAddress, sameAsComm } = req.body;
  const t = await employee_master.sequelize.transaction();


    // Merge address fields into personal data with proper keys matching your model columns
    const empData = {
      empid: personal.empid ? parseInt(personal.empid, 10) : null,
      ename: personal.ename,
  emptype: personal.emptype,
      
      // Communication Address fields (prefix with cadd_)
      cadd_sa: commAddress?.street || null,
      cadd_city: commAddress?.city || null,
      cadd_state: commAddress?.state || null,
      cadd_phone: commAddress?.phone || null,
      cadd_mobile: commAddress?.mobile || null,
      cadd_email: commAddress?.email || null,

      // Permanent Address fields (prefix with padd_)
      padd_sa: sameAsComm ? commAddress?.street || null : permAddress?.street || null,
      padd_city: sameAsComm ? commAddress?.city || null : permAddress?.city || null,
      padd_state: sameAsComm ? commAddress?.state || null : permAddress?.state || null,
      padd_phone: sameAsComm ? commAddress?.phone || null : permAddress?.phone || null,
      padd_mobile: sameAsComm ? commAddress?.mobile || null : permAddress?.mobile || null,
      padd_email: sameAsComm ? commAddress?.email || null : permAddress?.email || null,
    };
  console.log('EmpData',empData);
  try {

    // 1. Create employee
    const newEmployee = await employee_master.create(empData, { transaction: t });

    // 2. Prepare default user values
    const defaultPassword = 'AUCTOR';
    const password_hash = await bcrypt.hash(defaultPassword, 10);

    const username = empData.uname || newEmployee.empid.toString();
    const role = 'user';
    const created_by = req.session?.userId || null;

    // 3. Create user
    await User.create({
      username,
      password_hash,
      empid: newEmployee.empid,
      role,
      created_by,
      is_active: true,
      login_count: 0
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: 'Employee and user created successfully',
      employee: newEmployee
    });
  } catch (error) {
    await t.rollback();
    console.error('Error creating employee and user:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  const { empid } = req.params;
  try {
    const employee = await employee_master.findOne({ where: { empid } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await employee.update(req.body);
    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  const { empid } = req.params;
  try {
    const employee = await employee_master.findOne({ where: { empid } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await employee.destroy();
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
