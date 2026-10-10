const { EmpSalary, EmpSalaryHistory } = require('../models');
const { Op } = require('sequelize');

// Salary heads an increment may revise. These map 1:1 to m_emp_salary columns.
const SALARY_COMPONENTS = [
  'basic', 'hra', 'conveyance', 'washing_allowance',
  'others1', 'others2', 'others3', 'others4', 'others5',
  'others6', 'others7', 'others8', 'others9'
];

// Components that make up gross pay.
const GROSS_COMPONENTS = [
  'basic', 'hra', 'conveyance', 'washing_allowance',
  'others1', 'others2', 'others3', 'others4', 'others5',
  'others6', 'others7', 'others8', 'others9'
];

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Salary heads are whole rupees, so round rather than keep a decimal tail.
const roundSalary = (v) => Math.round(num(v));

const computeGross = (salary) =>
  GROSS_COMPONENTS.reduce((sum, key) => sum + num(salary?.[key]), 0);

const computeDeductions = (salary) =>
  ['deduct_others1', 'deduct_others2', 'deduct_others3', 'deduct_others4']
    .reduce((sum, key) => sum + num(salary?.[key]), 0);

/**
 * Resolve the salary in force for a given month.
 *
 * Increments are effective-dated, so a payslip run must not simply read the
 * current master — a run for an earlier month has to use the version that was
 * live then. Falls back to m_emp_salary when no version covers the month
 * (e.g. a period before the baseline was seeded).
 */
const getEffectiveSalary = async (empid, monthNum, yearNum, options = {}) => {
  if (!empid) return null;

  if (monthNum && yearNum) {
    const version = await EmpSalaryHistory.findOne({
      where: {
        empid,
        [Op.or]: [
          { effective_year: { [Op.lt]: yearNum } },
          { effective_year: yearNum, effective_month: { [Op.lte]: monthNum } }
        ]
      },
      order: [['effective_year', 'DESC'], ['effective_month', 'DESC']],
      ...options
    });
    if (version) return version;
  }

  return EmpSalary.findOne({ where: { empid }, ...options });
};

/**
 * Apply a component change on top of a salary object, returning a new object.
 * Used by approval to write both the master and the history version.
 */
const withComponent = (salary, component, newValue) => {
  // Accepts a Sequelize instance or a plain object.
  const plain = salary && typeof salary.toJSON === 'function' ? salary.toJSON() : (salary || {});
  const next = { ...plain };
  next[component] = roundSalary(newValue);
  return next;
};

/**
 * New value for a component given the increment type.
 * AMOUNT adds rupees, PERCENT adds a percentage of the current value.
 */
const computeNewValue = (oldValue, incType, incValue) => {
  const old = num(oldValue);
  const val = num(incValue);
  if (String(incType).toUpperCase() === 'PERCENT') {
    return roundSalary(old + (old * val) / 100);
  }
  return roundSalary(old + val);
};

module.exports = {
  SALARY_COMPONENTS,
  GROSS_COMPONENTS,
  num,
  roundSalary,
  computeGross,
  computeDeductions,
  getEffectiveSalary,
  withComponent,
  computeNewValue
};