const { ExitApplication, ExitClearance, FinalSettlement, EmpOfficial, EmpSalary } = require('../../models');
const { Op, Sequelize } = require('sequelize');

const CLEARANCE_DEPARTMENTS = ['IT', 'HR', 'Accounts', 'Stores', 'Admin', 'Security'];

// ===== EXIT APPLICATION =====
exports.getAllExits = async (req, res) => {
  try {
    const { status, empid } = req.query;
    const where = {};
    if (status) where.status = status;
    if (empid) where.empid = empid;
    const data = await ExitApplication.findAll({ where, order: [['created_at', 'DESC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.getExit = async (req, res) => {
  try {
    const exit = await ExitApplication.findByPk(req.params.id);
    if (!exit) return res.status(404).json({ message: 'Not found' });
    const clearance = await ExitClearance.findAll({ where: { exit_application_id: exit.id } });
    const settlement = await FinalSettlement.findOne({ where: { exit_application_id: exit.id } });
    res.json({ exit, clearance, settlement });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveExitApplication = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await ExitApplication.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      const emp = await EmpOfficial.findOne({ where: { empid: req.body.empid } });
      if (emp) req.body.empname = emp.ename;
      const created = await ExitApplication.create(req.body);
      // Auto-create clearance checklist
      const items = CLEARANCE_DEPARTMENTS.map((dept) => ({
        exit_application_id: created.id, department: dept, status: 'Pending',
      }));
      await ExitClearance.bulkCreate(items);
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.approveExit = async (req, res) => {
  try {
    const { id, status, approved_by } = req.body;
    const exit = await ExitApplication.findByPk(id);
    if (!exit) return res.status(404).json({ message: 'Not found' });
    await exit.update({ status, approved_by, approved_date: new Date().toISOString().slice(0, 10) });
    res.json({ success: true, message: `Exit ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== EXIT CLEARANCE =====
exports.getClearance = async (req, res) => {
  try {
    const { exit_application_id } = req.query;
    const where = {};
    if (exit_application_id) where.exit_application_id = exit_application_id;
    const data = await ExitClearance.findAll({ where, order: [['department', 'ASC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.updateClearance = async (req, res) => {
  try {
    const { id, status, cleared_by, remarks } = req.body;
    const update = { status };
    if (status === 'Cleared') {
      update.cleared_by = cleared_by || 'System';
      update.cleared_date = new Date().toISOString().slice(0, 10);
    }
    if (remarks) update.remarks = remarks;
    await ExitClearance.update(update, { where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== FINAL SETTLEMENT =====
exports.getSettlement = async (req, res) => {
  try {
    const { exit_application_id } = req.query;
    const data = await FinalSettlement.findOne({ where: { exit_application_id } });
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveSettlement = async (req, res) => {
  try {
    const { id, exit_application_id } = req.body;
    if (id) {
      await FinalSettlement.update(req.body, { where: { id } });
      res.json({ message: 'Updated', id });
    } else {
      const created = await FinalSettlement.create(req.body);
      res.status(201).json({ message: 'Saved', id: created.id });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.calculateSettlement = async (req, res) => {
  try {
    const { exit_application_id } = req.body;
    const exit = await ExitApplication.findByPk(exit_application_id);
    if (!exit) return res.status(404).json({ message: 'Exit not found' });

    const empOfficial = await EmpOfficial.findOne({ where: { empid: exit.empid } });
    const empSalary = await EmpSalary.findOne({ where: { empid: exit.empid } });

    const doj = empOfficial?.doj ? new Date(empOfficial.doj) : new Date();
    const lwd = exit.last_working_day ? new Date(exit.last_working_day) : new Date();
    const tenureMs = lwd - doj;
    const tenureYears = Math.max(0, tenureMs / (365.25 * 24 * 60 * 60 * 1000));
    const monthlySalary = Number(empSalary?.gross_salary || empSalary?.basic_pay || 0);
    const dailyRate = monthlySalary / 30;

    // Notice period
    const noticePeriodDays = 0;
    const noticePeriodAmount = noticePeriodDays * dailyRate;

    // Leave encashment (max 30 days)
    const leaveBalance = 0;
    const leaveEncashment = leaveBalance * dailyRate;

    // Gratuity: 15 days salary per year of service (eligibile after 5 years)
    const gratuityEligible = tenureYears >= 5;
    const gratuityAmount = gratuityEligible ? Math.min(15 * dailyRate * tenureYears, 2000000) : 0;

    // Salary due for month
    const salaryDueDays = 0;
    const salaryDueAmount = salaryDueDays * dailyRate;

    // Calculate net
    const grossPayable = leaveEncashment + gratuityAmount + salaryDueAmount;
    const tdsDeducted = 0;
    const netPayable = grossPayable - tdsDeducted;

    // Upsert settlement
    const [settlement] = await FinalSettlement.upsert({
      exit_application_id,
      empid: exit.empid,
      full_name: exit.empname,
      designation: empOfficial?.designation,
      department: empOfficial?.department,
      date_of_joining: empOfficial?.doj,
      last_working_day: exit.last_working_day,
      total_tenure_years: Math.round(tenureYears * 100) / 100,
      notice_period_days: noticePeriodDays,
      notice_period_amount: Math.round(noticePeriodAmount),
      leave_balance_days: leaveBalance,
      leave_encashment_amount: Math.round(leaveEncashment),
      gratuity_eligible: gratuityEligible,
      gratuity_amount: Math.round(gratuityAmount),
      salary_due_days: salaryDueDays,
      salary_due_amount: Math.round(salaryDueAmount),
      gross_payable: Math.round(grossPayable),
      tds_deducted: Math.round(tdsDeducted),
      net_payable: Math.round(netPayable),
      status: 'Draft',
    }, { returning: true });

    res.json({ message: 'Calculated', settlement });
  } catch (error) {
    res.status(500).json({ message: 'Calculation failed', error: error.message });
  }
};

exports.approveSettlement = async (req, res) => {
  try {
    const { id, status } = req.body;
    await FinalSettlement.update({ status, settlement_date: new Date().toISOString().slice(0, 10) }, { where: { id } });
    res.json({ success: true, message: `Settlement ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== DASHBOARD =====
exports.getExitDashboard = async (req, res) => {
  try {
    const pendingExits = await ExitApplication.count({ where: { status: 'Submitted' } });
    const approvedExits = await ExitApplication.count({ where: { status: 'Approved' } });
    const pendingClearance = await ExitClearance.count({ where: { status: 'Pending' } });
    const pendingSettlements = await FinalSettlement.count({ where: { status: 'Draft' } });
    const recent = await ExitApplication.findAll({ order: [['created_at', 'DESC']], limit: 5 });
    res.json({ pendingExits, approvedExits, pendingClearance, pendingSettlements, recent });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};
