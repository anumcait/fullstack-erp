const { PfLedger, PfChallan } = require('../../models/HR/pfAccounting');
const { EmpOfficial, EmpSalary } = require('../../models');
const { Op, Sequelize } = require('sequelize');

const PF_EMPLOYEE_RATE = 0.12;
const EPS_RATE = 0.0367;
const EPF_RATE = 0.0833;
const PF_WAGES_CEILING = 15000;

// ===== LEDGER =====
exports.getLedger = async (req, res) => {
  try {
    const { financial_year, month, empid } = req.query;
    const where = {};
    if (financial_year) where.financial_year = financial_year;
    if (month) where.month = month;
    if (empid) where.empid = empid;
    const data = await PfLedger.findAll({ where, order: [['empid', 'ASC']] });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.saveLedgerEntry = async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await PfLedger.update(req.body, { where: { id } });
      res.json({ message: 'Updated' });
    } else {
      await PfLedger.create(req.body);
      res.status(201).json({ message: 'Saved' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== GENERATE PF FOR MONTH =====
exports.generatePf = async (req, res) => {
  try {
    const { financial_year, month } = req.body;
    if (!financial_year || !month) return res.status(400).json({ message: 'financial_year and month required' });

    // Get all active employees
    const employees = await EmpOfficial.findAll({ where: { emp_status: 'Active' } });
    let created = 0;
    let skipped = 0;

    for (const emp of employees) {
      const existing = await PfLedger.findOne({ where: { empid: emp.empid, financial_year, month } });
      if (existing) { skipped++; continue; }

      const salary = await EmpSalary.findOne({ where: { empid: emp.empid } });
      const basicPay = Number(salary?.basic_pay || 0);
      const pfWages = Math.min(basicPay, PF_WAGES_CEILING);
      const employeeShare = Math.round(pfWages * PF_EMPLOYEE_RATE * 100) / 100;
      const epsShare = Math.round(Math.min(pfWages, PF_WAGES_CEILING) * EPS_RATE * 100) / 100;
      const epfShare = Math.round((pfWages * PF_EMPLOYEE_RATE - epsShare) * 100) / 100;
      const employerShare = epsShare + epfShare;

      await PfLedger.create({
        empid: emp.empid,
        financial_year,
        month,
        pf_wages: pfWages,
        employee_share: employeeShare,
        employer_share: employerShare,
        eps_share: epsShare,
        epf_share: epfShare,
      });
      created++;
    }

    res.json({ success: true, generated: created, skipped });
  } catch (error) {
    res.status(500).json({ message: 'Generation failed', error: error.message });
  }
};

// ===== CHALLAN =====
exports.getChallans = async (req, res) => {
  try {
    const data = await PfChallan.findAll({ order: [['created_at', 'DESC']], limit: 24 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.generateChallan = async (req, res) => {
  try {
    const { financial_year, month, remitted_date } = req.body;
    if (!financial_year || !month) return res.status(400).json({ message: 'financial_year and month required' });

    const existing = await PfChallan.findOne({ where: { financial_year, month } });
    if (existing) return res.status(400).json({ message: `Challan already exists for ${month}/${financial_year}` });

    const entries = await PfLedger.findAll({ where: { financial_year, month } });
    if (!entries.length) return res.status(400).json({ message: 'No PF entries found for this month' });

    const max = await PfChallan.findOne({ attributes: [[Sequelize.fn('MAX', Sequelize.col('id')), 'maxId']], raw: true });
    const challanNo = `PF-${financial_year}-${String(month).padStart(2, '0')}-${String((Number(max.maxId) || 0) + 1).padStart(3, '0')}`;

    const totals = entries.reduce(
      (acc, e) => ({
        total_wages: acc.total_wages + Number(e.pf_wages),
        total_employee_share: acc.total_employee_share + Number(e.employee_share),
        total_employer_share: acc.total_employer_share + Number(e.employer_share),
        total_eps: acc.total_eps + Number(e.eps_share),
        total_epf: acc.total_epf + Number(e.epf_share),
      }),
      { total_wages: 0, total_employee_share: 0, total_employer_share: 0, total_eps: 0, total_epf: 0 }
    );

    const challan = await PfChallan.create({
      challan_no: challanNo,
      financial_year,
      month,
      total_employees: entries.length,
      total_wages: Math.round(totals.total_wages * 100) / 100,
      total_employee_share: Math.round(totals.total_employee_share * 100) / 100,
      total_employer_share: Math.round(totals.total_employer_share * 100) / 100,
      total_eps: Math.round(totals.total_eps * 100) / 100,
      total_epf: Math.round(totals.total_epf * 100) / 100,
      grand_total: Math.round((totals.total_employee_share + totals.total_employer_share) * 100) / 100,
      remitted_date: remitted_date || null,
    });

    res.status(201).json({ message: 'Challan generated', challan });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

exports.updateChallan = async (req, res) => {
  try {
    const { id, remitted_date, status } = req.body;
    await PfChallan.update({ remitted_date, status }, { where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== REPORTS =====
exports.getReport = async (req, res) => {
  try {
    const { financial_year } = req.query;
    const where = {};
    if (financial_year) where.financial_year = financial_year;

    const data = await PfLedger.findAll({ where, order: [['month', 'ASC'], ['empid', 'ASC']] });
    const totals = data.reduce(
      (acc, e) => ({
        wages: acc.wages + Number(e.pf_wages),
        empShare: acc.empShare + Number(e.employee_share),
        emprShare: acc.emprShare + Number(e.employer_share),
        eps: acc.eps + Number(e.eps_share),
        epf: acc.epf + Number(e.epf_share),
      }),
      { wages: 0, empShare: 0, emprShare: 0, eps: 0, epf: 0 }
    );

    res.json({ data, totals });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};
