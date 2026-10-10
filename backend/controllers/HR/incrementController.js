const { Op } = require('sequelize');
const {
  EmpIncrement, EmpIncrementLine, EmpSalary, EmpSalaryHistory, EmployeeMaster, Payslip
} = require('../../models');
const { nextSequenceNumber, LOCK_KEYS } = require('../../utils/docNumber');
const {
  SALARY_COMPONENTS,
  num,
  computeGross,
  getEffectiveSalary,
  computeNewValue,
  withComponent
} = require('../../services/effectiveSalary');

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const INC_TYPES = ['AMOUNT', 'PERCENT'];
// Guards against a pasted spreadsheet taking the payroll process down.
const MAX_EMPLOYEES_PER_ENTRY = 100;

const isPayrollFinalized = async (monthNum, yearNum) => {
  const cnt = await Payslip.count({
    where: { C_MONTH: MONTH_NAMES[monthNum - 1], C_YEAR: String(yearNum), C_FINAL_STATUS: 2 }
  });
  return cnt > 0;
};

const monthSpan = (fromYear, fromMonth, toYear, toMonth) =>
  (toYear * 12 + toMonth) - (fromYear * 12 + fromMonth) + 1;

const validateArrears = (body) => {
  if (!body.has_arrears) return { errors: {}, arrears: null };
  const errors = {};
  const fm = parseInt(body.arrears_from_month, 10);
  const fy = parseInt(body.arrears_from_year, 10);
  const tm = parseInt(body.arrears_to_month, 10);
  const ty = parseInt(body.arrears_to_year, 10);
  const valid = (m, y) => Number.isInteger(m) && m >= 1 && m <= 12
    && Number.isInteger(y) && y >= 2000 && y <= 2100;

  if (!valid(fm, fy)) errors.arrears_from = 'Select arrears start month and year';
  if (!valid(tm, ty)) errors.arrears_to = 'Select arrears end month and year';
  if (valid(fm, fy) && valid(tm, ty) && monthSpan(fy, fm, ty, tm) <= 0) {
    errors.arrears_to = 'Arrears end must not be before the start';
  }
  if (Object.keys(errors).length) return { errors, arrears: null };

  return {
    errors,
    arrears: {
      arrears_from_month: fm,
      arrears_from_year: fy,
      arrears_to_month: tm,
      arrears_to_year: ty,
      arrears_months: monthSpan(fy, fm, ty, tm)
    }
  };
};

/**
 * Turn the grid payload into concrete lines against current salaries.
 * The grid posts one entry per employee: { empid, components: { basic: 10, hra: 500 } }
 * `incType` decides whether those numbers are percentages or rupees.
 */
const buildLines = (entry, incType, salary) => {
  const lines = [];
  Object.entries(entry.components || {}).forEach(([component, rawValue]) => {
    if (!SALARY_COMPONENTS.includes(component)) return;
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value === 0) return;
    if (incType === 'PERCENT' && (value < 0 || value > 100)) return;
    if (incType === 'AMOUNT' && value < 0) return;

    const oldValue = num(salary?.[component]);
    const newValue = computeNewValue(oldValue, incType, value);
    if (newValue <= 0) return;
    lines.push({ component, inc_type: incType, inc_value: value, old_value: oldValue, new_value: newValue });
  });
  return lines;
};

/** Employees plus the salary in force for the given month — seeds the grid. */
exports.getFormData = async (req, res) => {
  try {
    const monthNum = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);
    const yearNum = parseInt(req.query.year, 10) || new Date().getFullYear();
    const onlyEmp = parseInt(req.query.empid, 10);

    const empWhere = { is_active: true };
    if (onlyEmp) empWhere.empid = onlyEmp;

    const employees = await EmployeeMaster.findAll({
      where: empWhere,
      order: [['empid', 'ASC']],
      // employee_master exposes deptname; there is no department/designation column.
      attributes: ['empid', 'ename', 'deptname']
    });

    const ids = employees.map(e => e.empid);
    const [masters, histories] = await Promise.all([
      EmpSalary.findAll({ where: { empid: ids } }),
      EmpSalaryHistory.findAll({
        where: {
          empid: ids,
          [Op.or]: [
            { effective_year: { [Op.lt]: yearNum } },
            { effective_year: yearNum, effective_month: { [Op.lte]: monthNum } }
          ]
        },
        order: [['effective_year', 'DESC'], ['effective_month', 'DESC']]
      })
    ]);

    const masterMap = {};
    masters.forEach(m => { masterMap[m.empid] = m; });
    const histMap = {};
    histories.forEach(h => { if (!histMap[h.empid]) histMap[h.empid] = h; });

    const rows = employees.map(e => {
      const salary = histMap[e.empid] || masterMap[e.empid];
      const components = {};
      SALARY_COMPONENTS.forEach(k => { components[k] = salary ? num(salary[k]) : null; });
      return {
        empid: e.empid,
        ename: e.ename,
        department: e.deptname,
        designation: e.designation || null,
        has_salary: !!salary,
        components,
        gross: salary ? computeGross(salary) : null
      };
    });

    res.json({
      success: true,
      data: { effective_month: monthNum, effective_year: yearNum, components: SALARY_COMPONENTS, rows }
    });
  } catch (err) {
    console.error('Error loading increment grid:', err);
    res.status(500).json({ success: false, message: 'Error loading employee salary details' });
  }
};

const withLines = async (rows) => {
  if (!rows.length) return rows;
  const ids = rows.map(r => r.increment_id);
  const lines = await EmpIncrementLine.findAll({
    where: { increment_id: ids },
    order: [['increment_id', 'ASC'], ['id', 'ASC']]
  });
  const byInc = {};
  lines.forEach(l => {
    if (!byInc[l.increment_id]) byInc[l.increment_id] = [];
    byInc[l.increment_id].push(l);
  });
  // Sequelize keeps attribute values in dataValues, so toJSON() is required for
  // the spread to carry empid/increment_id through.
  return rows.map(r => ({ ...r.toJSON(), lines: byInc[r.increment_id] || [] }));
};

exports.getAllIncrements = async (req, res) => {
  try {
    const { empid, status } = req.query;
    const where = {};
    if (empid) where.empid = parseInt(empid, 10);
    if (status) where.status = status;

    const rows = await EmpIncrement.findAll({ where, order: [['increment_id', 'DESC']] });
    res.json(await withLines(rows));
  } catch (err) {
    console.error('Error fetching increments:', err);
    res.status(500).json({ success: false, message: 'Error fetching increments' });
  }
};

exports.getByEmployee = async (req, res) => {
  try {
    const empid = parseInt(req.params.empid, 10);
    if (!empid) return res.status(400).json({ success: false, message: 'Employee is required' });
    const rows = await EmpIncrement.findAll({
      where: { empid, status: 'Approved' },
      order: [['effective_year', 'DESC'], ['effective_month', 'DESC'], ['increment_id', 'DESC']]
    });
    res.json(await withLines(rows));
  } catch (err) {
    console.error('Error fetching employee increments:', err);
    res.status(500).json({ success: false, message: 'Error fetching employee increments' });
  }
};

exports.getNextId = async (req, res) => {
  try {
    const maxId = (await EmpIncrement.max('increment_id')) || 0;
    res.json({ nextIncrementId: Number(maxId) + 1 });
  } catch (err) {
    console.error('Error getting next increment ID:', err);
    res.status(500).json({ success: false, message: 'Error getting next increment ID' });
  }
};

/**
 * Save the grid. One header per employee that actually has a value, each with
 * its own lines, all sharing the effective period and reason. Employees with
 * nothing entered are skipped rather than rejected, so a partially filled grid
 * still saves.
 */
exports.createIncrement = async (req, res) => {
  try {
    const body = req.body || {};
    const effectiveMonth = parseInt(body.effective_month, 10);
    const effectiveYear = parseInt(body.effective_year, 10);
    const incType = String(body.inc_type || '').toUpperCase();
    const reason = String(body.reason || '').trim();
    const entries = Array.isArray(body.entries) ? body.entries : [];

    const errors = {};
    if (!Number.isInteger(effectiveMonth) || effectiveMonth < 1 || effectiveMonth > 12) {
      errors.effective_month = 'Select a valid month';
    }
    if (!Number.isInteger(effectiveYear) || effectiveYear < 2000 || effectiveYear > 2100) {
      errors.effective_year = 'Select a valid year';
    }
    if (!INC_TYPES.includes(incType)) errors.inc_type = 'Select Amount or Percentage';
    if (!reason) errors.reason = 'Reason is mandatory';
    if (!entries.length) errors.entries = 'Enter at least one increment value';
    if (entries.length > MAX_EMPLOYEES_PER_ENTRY) {
      errors.entries = `A maximum of ${MAX_EMPLOYEES_PER_ENTRY} employees can be saved at once`;
    }

    const { errors: arrearErrors, arrears } = validateArrears(body);
    Object.assign(errors, arrearErrors);

    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: 'Please correct the highlighted fields', errors });
    }

    if (await isPayrollFinalized(effectiveMonth, effectiveYear)) {
      return res.status(400).json({
        success: false,
        message: `Payslip finalized for ${MONTH_NAMES[effectiveMonth - 1]} ${effectiveYear} — cannot raise increments.`
      });
    }

    const created = [];
    const skipped = [];

    for (const entry of entries) {
      const empid = parseInt(entry.empid, 10);
      if (!empid) { skipped.push({ empid: entry.empid, reason: 'invalid employee' }); continue; }

      const emp = await EmployeeMaster.findByPk(empid);
      if (!emp || !emp.is_active) { skipped.push({ empid, reason: 'inactive or missing' }); continue; }

      const salary = await getEffectiveSalary(empid, effectiveMonth, effectiveYear);
      if (!salary) { skipped.push({ empid, reason: 'no salary master' }); continue; }

      const lines = buildLines(entry, incType, salary);
      if (!lines.length) { skipped.push({ empid, reason: 'no values entered' }); continue; }

      const dup = await EmpIncrement.findOne({
        where: { empid, status: 'Pending', effective_month: effectiveMonth, effective_year: effectiveYear }
      });
      if (dup) {
        const dupLines = await EmpIncrementLine.findAll({ where: { increment_id: dup.increment_id } });
        const dupComponents = new Set(dupLines.map(l => l.component));
        const clash = lines.filter(l => dupComponents.has(l.component));
        if (clash.length) {
          skipped.push({
            empid,
            reason: `${clash.map(l => l.component).join(', ')} already pending in #${dup.increment_id}`
          });
          continue;
        }
      }

      const t = await EmpIncrement.sequelize.transaction();
      try {
        const incrementId = await nextSequenceNumber(EmpIncrement, 'increment_id', t, LOCK_KEYS.EMP_INCREMENT);
        const header = await EmpIncrement.create({
          increment_id: incrementId,
          empid,
          ename: emp.ename,
          department: emp.deptname || emp.department,
          designation: emp.designation,
          applied_date: new Date(),
          effective_month: effectiveMonth,
          effective_year: effectiveYear,
          has_arrears: !!body.has_arrears,
          ...(arrears || {}),
          reason,
          status: 'Pending',
          created_by: req.session?.user?.username || 'Admin',
          applied_to_salary: false
        }, { transaction: t });

        await EmpIncrementLine.bulkCreate(
          lines.map(l => ({ ...l, increment_id: incrementId })),
          { transaction: t }
        );
        await t.commit();
        created.push({ ...header.toJSON(), lines });
      } catch (txErr) {
        await t.rollback();
        throw txErr;
      }
    }

    if (!created.length) {
      return res.status(400).json({
        success: false,
        message: 'Nothing could be saved',
        errors: { entries: skipped.map(s => `${s.empid}: ${s.reason}`).join('; ') || 'no entries' }
      });
    }

    res.status(201).json({
      success: true,
      message: `Saved ${created.length} increment application(s)`,
      created_count: created.length,
      skipped,
      data: created
    });
  } catch (err) {
    console.error('Error creating increments:', err);
    res.status(500).json({ success: false, message: 'Error creating increments' });
  }
};

/**
 * Edit a Pending entry. Approved/Rejected entries are locked: approval has
 * already rewritten m_emp_salary and appended a history version, so changing
 * the figures afterwards would leave salary and payroll disagreeing.
 */
exports.updateIncrement = async (req, res) => {
  const body = req.body || {};
  try {
    const inc = await EmpIncrement.findByPk(req.params.increment_id);
    if (!inc) return res.status(404).json({ success: false, message: 'Increment not found' });
    if (inc.status !== 'Pending' || inc.applied_to_salary) {
      return res.status(400).json({
        success: false,
        message: `Increment #${inc.increment_id} is ${inc.status} and can no longer be edited`
      });
    }

    const effectiveMonth = parseInt(body.effective_month, 10);
    const effectiveYear = parseInt(body.effective_year, 10);
    const reason = String(body.reason || '').trim();

    const errors = {};
    if (!Number.isInteger(effectiveMonth) || effectiveMonth < 1 || effectiveMonth > 12) {
      errors.effective_month = 'Select a valid month';
    }
    if (!Number.isInteger(effectiveYear) || effectiveYear < 2000 || effectiveYear > 2100) {
      errors.effective_year = 'Select a valid year';
    }
    if (!reason) errors.reason = 'Reason is mandatory';

    const { errors: arrearErrors, arrears } = validateArrears(body);
    Object.assign(errors, arrearErrors);

    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: 'Please correct the highlighted fields', errors });
    }

    // The period it currently sits in matters too: moving an entry out of a
    // finalized month would change a salary that has already been paid.
    if ((inc.effective_month !== effectiveMonth || inc.effective_year !== effectiveYear)
      && await isPayrollFinalized(inc.effective_month, inc.effective_year)) {
      return res.status(400).json({
        success: false,
        message: `Payslip finalized for ${MONTH_NAMES[inc.effective_month - 1]} ${inc.effective_year} — cannot move this increment out of it.`
      });
    }

    if (await isPayrollFinalized(effectiveMonth, effectiveYear)) {
      return res.status(400).json({
        success: false,
        message: `Payslip finalized for ${MONTH_NAMES[effectiveMonth - 1]} ${effectiveYear} — cannot edit.`
      });
    }

    const empid = inc.empid;
    const salary = await getEffectiveSalary(empid, effectiveMonth, effectiveYear);
    if (!salary) {
      return res.status(400).json({ success: false, message: 'No salary master record for this employee' });
    }

    // Old/new are recomputed against the salary now in force, exactly as on create.
    const lines = buildLines({ empid, components: body.components || {} }, 'AMOUNT', salary);
    if (!lines.length) {
      return res.status(400).json({
        success: false,
        message: 'Nothing could be saved',
        errors: { components: 'Enter an amount against at least one salary head' }
      });
    }

    const t = await EmpIncrement.sequelize.transaction();
    try {
      await EmpIncrementLine.destroy({ where: { increment_id: inc.increment_id }, transaction: t });
      await EmpIncrementLine.bulkCreate(
        lines.map(l => ({ ...l, increment_id: inc.increment_id })),
        { transaction: t }
      );

      inc.effective_month = effectiveMonth;
      inc.effective_year = effectiveYear;
      inc.reason = reason;
      inc.has_arrears = !!body.has_arrears;
      Object.assign(inc, arrears || {
        arrears_from_month: null, arrears_from_year: null,
        arrears_to_month: null, arrears_to_year: null,
        arrears_months: null, arrears_amount: null
      });
      await inc.save({ transaction: t });
      await t.commit();
    } catch (txErr) {
      await t.rollback();
      throw txErr;
    }

    const fresh = await EmpIncrement.findByPk(inc.increment_id, {
      include: [{ model: EmpIncrementLine, as: 'lines' }]
    });
    res.json({ success: true, message: `Increment #${inc.increment_id} updated`, data: fresh });
  } catch (err) {
    console.error('Error updating increment:', err);
    res.status(500).json({ success: false, message: 'Error updating increment' });
  }
};

/**
 * Approving applies every line of the entry: the salary master is rewritten and
 * one history version stamped with the effective month is recorded.
 */
exports.approveIncrement = async (req, res) => {
  const { increment_id, approval_remark } = req.body;
  try {
    const inc = await EmpIncrement.findByPk(increment_id, {
      include: [{ model: EmpIncrementLine, as: 'lines' }]
    });
    if (!inc) return res.status(404).json({ success: false, message: 'Increment not found' });
    if (inc.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Increment is already ${inc.status}` });
    }
    if (inc.applied_to_salary) {
      return res.status(400).json({ success: false, message: 'This increment has already been applied to salary master' });
    }
    if (!inc.lines || !inc.lines.length) {
      return res.status(400).json({ success: false, message: 'This increment has no component lines to apply' });
    }
    if (await isPayrollFinalized(inc.effective_month, inc.effective_year)) {
      return res.status(400).json({
        success: false,
        message: `Payslip finalized for ${MONTH_NAMES[inc.effective_month - 1]} ${inc.effective_year} — cannot approve.`
      });
    }

    const t = await EmpIncrement.sequelize.transaction();
    try {
      const salary = await getEffectiveSalary(inc.empid, inc.effective_month, inc.effective_year, { transaction: t });
      if (!salary) {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'No salary master record for this employee' });
      }

      let updated = withComponent(salary, inc.lines[0].component, inc.lines[0].new_value);
      inc.lines.forEach(line => {
        updated = withComponent(updated, line.component, line.new_value);
      });

      const masterRow = { empid: inc.empid };
      [...SALARY_COMPONENTS, 'deduct_others1', 'deduct_others2', 'deduct_others3', 'deduct_others4',
        'IS_esi', 'IS_pf', 'IS_lic', 'IS_ot', 'tds_amount', 'lic_amount', 'pay_mode']
        .forEach(k => { if (updated[k] !== undefined && updated[k] !== null) masterRow[k] = updated[k]; });
      masterRow.c_last_update = new Date();
      masterRow.c_upd_userid = req.session?.userId || null;

      await EmpSalary.upsert(masterRow, { transaction: t });

      await EmpSalaryHistory.create({
        empid: inc.empid,
        effective_month: inc.effective_month,
        effective_year: inc.effective_year,
        basic: updated.basic, hra: updated.hra, conveyance: updated.conveyance,
        washing_allowance: updated.washing_allowance,
        others1: updated.others1, others2: updated.others2, others3: updated.others3,
        others4: updated.others4, others5: updated.others5, others6: updated.others6,
        others7: updated.others7, others8: updated.others8, others9: updated.others9,
        deduct_others1: updated.deduct_others1, deduct_others2: updated.deduct_others2,
        deduct_others3: updated.deduct_others3, deduct_others4: updated.deduct_others4,
        IS_esi: updated.IS_esi, IS_pf: updated.IS_pf, IS_lic: updated.IS_lic, IS_ot: updated.IS_ot,
        tds_amount: updated.tds_amount, lic_amount: updated.lic_amount, pay_mode: updated.pay_mode,
        increment_id: inc.increment_id,
        created_by: req.session?.user?.username || 'Admin',
        created_date: new Date()
      }, { transaction: t });

      inc.status = 'Approved';
      inc.applied_to_salary = true;
      inc.approved_by = req.session?.user?.username || 'Admin';
      inc.approved_date = new Date();
      if (approval_remark) inc.approval_remark = String(approval_remark).slice(0, 200);
      await inc.save({ transaction: t });

      await t.commit();
      res.json({
        success: true,
        message: `Increment approved. ${inc.lines.length} component(s) applied for emp ${inc.empid}`,
        data: inc
      });
    } catch (txErr) {
      await t.rollback();
      throw txErr;
    }
  } catch (err) {
    console.error('Error approving increment:', err);
    res.status(500).json({ success: false, message: 'Error approving increment' });
  }
};

exports.rejectIncrement = async (req, res) => {
  const { increment_id, approval_remark } = req.body;
  try {
    const inc = await EmpIncrement.findByPk(increment_id);
    if (!inc) return res.status(404).json({ success: false, message: 'Increment not found' });
    if (inc.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Increment is already ${inc.status}` });
    }
    if (!approval_remark || !String(approval_remark).trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is mandatory' });
    }

    inc.status = 'Rejected';
    inc.approval_remark = String(approval_remark).trim().slice(0, 200);
    inc.approved_by = req.session?.user?.username || 'Admin';
    inc.approved_date = new Date();
    await inc.save();

    res.json({ success: true, message: `Increment #${inc.increment_id} rejected` });
  } catch (err) {
    console.error('Error rejecting increment:', err);
    res.status(500).json({ success: false, message: 'Error rejecting increment' });
  }
};

exports.getSalaryHistory = async (req, res) => {
  try {
    const empid = parseInt(req.params.empid, 10);
    if (!empid) return res.status(400).json({ success: false, message: 'Employee is required' });
    const rows = await EmpSalaryHistory.findAll({
      where: { empid },
      order: [['effective_year', 'DESC'], ['effective_month', 'DESC']]
    });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching salary history:', err);
    res.status(500).json({ success: false, message: 'Error fetching salary history' });
  }
};

exports.getComponents = async (req, res) => {
  res.json({ components: SALARY_COMPONENTS, types: INC_TYPES, maxEmployees: MAX_EMPLOYEES_PER_ENTRY });
};