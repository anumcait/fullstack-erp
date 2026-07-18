const db = require('../../models');
const { Op } = require('sequelize');

const { ChartOfAccount } = db;

exports.list = async (req, res) => {
  try {
    const rows = await ChartOfAccount.findAll({
      include: [{ model: ChartOfAccount, as: 'parent', attributes: ['id', 'account_name', 'account_code'] }],
      order: [['account_code', 'ASC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('coa.list', err);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

exports.get = async (req, res) => {
  try {
    const row = await ChartOfAccount.findByPk(req.params.id, {
      include: [{ model: ChartOfAccount, as: 'parent', attributes: ['id', 'account_name', 'account_code'] }],
    });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    console.error('coa.get', err);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
};

exports.create = async (req, res) => {
  try {
    const { account_code, account_name, account_type, parent_id, is_group, opening_balance, opening_balance_type, notes } = req.body;
    if (!account_code || !account_name || !account_type) {
      return res.status(400).json({ error: 'account_code, account_name, and account_type are required' });
    }
    const existing = await ChartOfAccount.findOne({ where: { account_code } });
    if (existing) return res.status(409).json({ error: 'Account code already exists' });
    const row = await ChartOfAccount.create({ account_code, account_name, account_type, parent_id, is_group, opening_balance, opening_balance_type, notes });
    res.status(201).json(row);
  } catch (err) {
    console.error('coa.create', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

exports.update = async (req, res) => {
  try {
    const row = await ChartOfAccount.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    await row.update(req.body);
    res.json(row);
  } catch (err) {
    console.error('coa.update', err);
    res.status(500).json({ error: 'Failed to update account' });
  }
};

exports.remove = async (req, res) => {
  try {
    const row = await ChartOfAccount.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const children = await ChartOfAccount.count({ where: { parent_id: row.id } });
    if (children > 0) return res.status(409).json({ error: 'Delete child accounts first' });
    await row.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('coa.delete', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

exports.tree = async (req, res) => {
  try {
    const rows = await ChartOfAccount.findAll({ where: { parent_id: null, is_active: true }, order: [['account_code', 'ASC']] });
    const tree = await Promise.all(rows.map(async (root) => buildTree(root)));
    res.json(tree);
  } catch (err) {
    console.error('coa.tree', err);
    res.status(500).json({ error: 'Failed to build tree' });
  }
};

async function buildTree(node) {
  const children = await ChartOfAccount.findAll({ where: { parent_id: node.id, is_active: true }, order: [['account_code', 'ASC']] });
  return {
    ...node.toJSON(),
    children: await Promise.all(children.map(buildTree)),
  };
}
