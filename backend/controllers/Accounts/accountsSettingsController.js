const db = require('../../models/Accounts');
const { AccountsSettings, FinancialYear } = db;

exports.getSettings = async (req, res) => {
  try {
    const settings = await AccountsSettings.findAll();
    const fys = await FinancialYear.findAll({ order: [['start_date', 'DESC']] });
    const map = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    res.json({ settings: map, financial_years: fys });
  } catch (err) {
    console.error('settings.get', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const allowed = ['default_fy_id', 'company_name', 'address', 'gstin', 'pan'];
    for (const key of Object.keys(req.body)) {
      if (allowed.includes(key)) {
        await AccountsSettings.upsert({ key, value: String(req.body[key]) });
      }
    }
    const settings = await AccountsSettings.findAll();
    const map = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    res.json({ settings: map });
  } catch (err) {
    console.error('settings.update', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

exports.createFinancialYear = async (req, res) => {
  try {
    const { name, start_date, end_date } = req.body;
    if (!name || !start_date || !end_date) return res.status(400).json({ error: 'name, start_date, end_date required' });
    const existing = await FinancialYear.findOne({ where: { name } });
    if (existing) return res.status(409).json({ error: 'Financial year already exists' });
    const fy = await FinancialYear.create({ name, start_date, end_date });
    res.status(201).json(fy);
  } catch (err) {
    console.error('fy.create', err);
    res.status(500).json({ error: 'Failed to create financial year' });
  }
};

exports.setActiveFinancialYear = async (req, res) => {
  try {
    const { id } = req.params;
    await FinancialYear.update({ is_active: false }, { where: { is_active: true } });
    await FinancialYear.update({ is_active: true }, { where: { id } });
    const fy = await FinancialYear.findByPk(id);
    res.json(fy);
  } catch (err) {
    console.error('fy.setActive', err);
    res.status(500).json({ error: 'Failed to set active financial year' });
  }
};

exports.getFinancialYears = async (req, res) => {
  try {
    const rows = await FinancialYear.findAll({ order: [['start_date', 'DESC']] });
    res.json(rows);
  } catch (err) {
    console.error('fy.list', err);
    res.status(500).json({ error: 'Failed to fetch financial years' });
  }
};
