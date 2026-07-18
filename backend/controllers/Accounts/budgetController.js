const db = require('../../models');
const { Op } = require('sequelize');

const { Budget, FinancialYear, ChartOfAccount } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.financial_year_id) where.financial_year_id = req.query.financial_year_id;
    const rows = await Budget.findAll({
      where,
      include: [
        { model: FinancialYear, as: 'financialYear', attributes: ['id', 'name'] },
        { model: ChartOfAccount, as: 'account', attributes: ['id', 'account_code', 'account_name', 'account_type'] },
      ],
      order: [[{ model: ChartOfAccount, as: 'account' }, 'account_code', 'ASC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('budget.list', err);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

exports.upsert = async (req, res) => {
  try {
    const { financial_year_id, account_id, monthly_amounts } = req.body;
    if (!financial_year_id || !account_id) {
      return res.status(400).json({ error: 'financial_year_id and account_id are required' });
    }
    const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    const data = { financial_year_id, account_id };
    if (monthly_amounts) {
      months.forEach((m, i) => { data[m] = monthly_amounts[i] || 0; });
    }
    const [budget, created] = await Budget.upsert(data, { returning: true });
    res.status(created ? 201 : 200).json(budget);
  } catch (err) {
    console.error('budget.upsert', err);
    res.status(500).json({ error: 'Failed to save budget' });
  }
};

exports.remove = async (req, res) => {
  try {
    const row = await Budget.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('budget.delete', err);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
};

exports.vsActual = async (req, res) => {
  try {
    const { financial_year_id } = req.query;
    if (!financial_year_id) return res.status(400).json({ error: 'financial_year_id is required' });
    const budgets = await Budget.findAll({
      where: { financial_year_id },
      include: [{ model: ChartOfAccount, as: 'account', attributes: ['id', 'account_code', 'account_name'] }],
    });
    const fy = await FinancialYear.findByPk(financial_year_id);
    const months = ['apr','may','jun','jul','aug','sep','oct','nov','dec','jan','feb','mar'];
    const result = await Promise.all(budgets.map(async (b) => {
      const total_budget = months.reduce((s, m) => s + parseFloat(b[m] || 0), 0);
      const actualItems = await require('./ledgerController').trialBalance({
        query: { as_on: fy?.end_date || new Date().toISOString().slice(0, 10) },
      }, { json: (d) => d });
      const actual = Array.isArray(actualItems) ? actualItems.find(a => a.id === b.account_id) : null;
      return {
        id: b.id, account: b.account, total_budget, actual: actual?.closing || 0,
        variance: total_budget - (actual?.closing || 0),
      };
    }));
    res.json(result);
  } catch (err) {
    console.error('budget.vsActual', err);
    res.status(500).json({ error: 'Failed to generate budget vs actual report' });
  }
};
