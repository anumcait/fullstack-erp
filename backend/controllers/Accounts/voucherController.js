const db = require('../../models/Accounts');
const { Op, Sequelize } = require('sequelize');

const { Voucher, VoucherItem, VoucherType, ChartOfAccount, FinancialYear } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.voucher_type_id) where.voucher_type_id = req.query.voucher_type_id;
    if (req.query.status) where.status = req.query.status;
    if (req.query.from) where.date = { ...where.date, [Op.gte]: req.query.from };
    if (req.query.to) where.date = { ...where.date, [Op.lte]: req.query.to };
    const rows = await Voucher.findAll({
      where,
      include: [
        { model: VoucherType, as: 'voucherType', attributes: ['id', 'code', 'name'] },
        { model: VoucherItem, as: 'items', include: [{ model: ChartOfAccount, as: 'account', attributes: ['id', 'account_code', 'account_name'] }] },
      ],
      order: [['date', 'DESC'], ['created_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('voucher.list', err);
    res.status(500).json({ error: 'Failed to fetch vouchers' });
  }
};

exports.get = async (req, res) => {
  try {
    const row = await Voucher.findByPk(req.params.id, {
      include: [
        { model: VoucherType, as: 'voucherType', attributes: ['id', 'code', 'name'] },
        { model: FinancialYear, as: 'financialYear', attributes: ['id', 'name'] },
        { model: VoucherItem, as: 'items', include: [
          { model: ChartOfAccount, as: 'account', attributes: ['id', 'account_code', 'account_name'] },
          { model: ChartOfAccount, as: 'againstAccount', attributes: ['id', 'account_code', 'account_name'] },
        ]},
      ],
    });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    console.error('voucher.get', err);
    res.status(500).json({ error: 'Failed to fetch voucher' });
  }
};

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { voucher_type_id, date, reference_no, reference_date, narration, items } = req.body;
    if (!voucher_type_id || !date || !items || !items.length) {
      return res.status(400).json({ error: 'voucher_type_id, date, and items are required' });
    }
    const vtype = await VoucherType.findByPk(voucher_type_id, { transaction: t });
    if (!vtype) return res.status(400).json({ error: 'Invalid voucher type' });
    const fy = await getActiveFinancialYear(t);
    const prefix = vtype.code;
    const seq = await getNextSequence(prefix, t);
    const voucher_no = `${prefix}-${String(seq).padStart(5, '0')}`;
    let total_debit = 0, total_credit = 0;
    for (const item of items) {
      total_debit += parseFloat(item.debit || 0);
      total_credit += parseFloat(item.credit || 0);
    }
    const voucher = await Voucher.create({
      voucher_no, voucher_type_id, financial_year_id: fy?.id || null,
      date, reference_no, reference_date, narration,
      total_debit, total_credit, status: 'Posted',
    }, { transaction: t });
    for (const item of items) {
      await VoucherItem.create({ ...item, voucher_id: voucher.id }, { transaction: t });
    }
    await t.commit();
    const created = await Voucher.findByPk(voucher.id, {
      include: [
        { model: VoucherType, as: 'voucherType' },
        { model: VoucherItem, as: 'items', include: [{ model: ChartOfAccount, as: 'account' }] },
      ],
    });
    res.status(201).json(created);
  } catch (err) {
    await t.rollback();
    console.error('voucher.create', err);
    res.status(500).json({ error: 'Failed to create voucher: ' + err.message });
  }
};

exports.update = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const voucher = await Voucher.findByPk(req.params.id, { transaction: t });
    if (!voucher) return res.status(404).json({ error: 'Not found' });
    if (voucher.status === 'Posted') return res.status(400).json({ error: 'Cannot edit a posted voucher' });
    const { date, reference_no, reference_date, narration, items } = req.body;
    let total_debit = 0, total_credit = 0;
    if (items) {
      for (const item of items) {
        total_debit += parseFloat(item.debit || 0);
        total_credit += parseFloat(item.credit || 0);
      }
    }
    await voucher.update({ date, reference_no, reference_date, narration, total_debit, total_credit }, { transaction: t });
    if (items) {
      await VoucherItem.destroy({ where: { voucher_id: voucher.id }, transaction: t });
      for (const item of items) {
        await VoucherItem.create({ ...item, voucher_id: voucher.id }, { transaction: t });
      }
    }
    await t.commit();
    const updated = await Voucher.findByPk(voucher.id, {
      include: [
        { model: VoucherType, as: 'voucherType' },
        { model: VoucherItem, as: 'items', include: [{ model: ChartOfAccount, as: 'account' }] },
      ],
    });
    res.json(updated);
  } catch (err) {
    await t.rollback();
    console.error('voucher.update', err);
    res.status(500).json({ error: 'Failed to update voucher: ' + err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ error: 'Not found' });
    if (voucher.status === 'Posted') return res.status(400).json({ error: 'Cannot delete a posted voucher' });
    await VoucherItem.destroy({ where: { voucher_id: voucher.id } });
    await voucher.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('voucher.delete', err);
    res.status(500).json({ error: 'Failed to delete voucher' });
  }
};

exports.post = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ error: 'Not found' });
    if (voucher.status !== 'Draft') return res.status(400).json({ error: 'Only draft vouchers can be posted' });
    await voucher.update({ status: 'Posted', approved_by: req.user?.id || null, approved_at: new Date() });
    res.json(voucher);
  } catch (err) {
    console.error('voucher.post', err);
    res.status(500).json({ error: 'Failed to post voucher' });
  }
};

exports.cancel = async (req, res) => {
  try {
    const voucher = await Voucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ error: 'Not found' });
    if (voucher.status === 'Cancelled') return res.status(400).json({ error: 'Already cancelled' });
    await voucher.update({ status: 'Cancelled' });
    res.json(voucher);
  } catch (err) {
    console.error('voucher.cancel', err);
    res.status(500).json({ error: 'Failed to cancel voucher' });
  }
};

exports.getTypes = async (req, res) => {
  try {
    const types = await VoucherType.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    res.json(types);
  } catch (err) {
    console.error('voucher.getTypes', err);
    res.status(500).json({ error: 'Failed to fetch voucher types' });
  }
};

let seqCache = {};
async function getNextSequence(prefix, t) {
  const last = await Voucher.findOne({
    where: { voucher_no: { [Op.like]: `${prefix}-%` } },
    order: [['voucher_no', 'DESC']],
    transaction: t,
  });
  let num = 1;
  if (last) {
    const parts = last.voucher_no.split('-');
    num = parseInt(parts[parts.length - 1], 10) + 1;
  }
  return num;
}

async function getActiveFinancialYear(t) {
  return await FinancialYear.findOne({ where: { is_active: true }, transaction: t });
}
