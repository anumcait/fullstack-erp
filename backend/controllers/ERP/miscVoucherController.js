const { Op } = require('sequelize');
const db = require('../../models/ERP');
const { nextDocNumber } = require('../../utils/docNumber');
const { getStoresSettings } = require('../../utils/stockService');

const round2 = (v) => Number(Number(v || 0).toFixed(2));

async function generateVoucherNo() {
  const settings = await getStoresSettings();
  return nextDocNumber(db.MiscVoucher, 'voucher_no', Number(settings?.voucher_start_no) || 1, settings?.voucher_prefix);
}

exports.getNextNumber = async (req, res) => {
  try {
    const voucher_no = await generateVoucherNo();
    res.json({ voucher_no });
  } catch (err) {
    console.error('Error generating voucher number:', err);
    res.status(500).json({ error: 'Failed to generate voucher number' });
  }
};

exports.getList = async (req, res) => {
  try {
    const { search, status, voucher_type, date_from, date_to } = req.query;
    const where = {};
    if (status) where.status = status;
    if (voucher_type) where.voucher_type = voucher_type;
    if (date_from && date_to) {
      where.voucher_date = { [Op.between]: [date_from, date_to] };
    } else if (date_from) {
      where.voucher_date = { [Op.gte]: date_from };
    } else if (date_to) {
      where.voucher_date = { [Op.lte]: date_to };
    }
    if (search) {
      where[Op.or] = [
        { voucher_no: { [Op.iLike]: `%${search}%` } },
        { party_name: { [Op.iLike]: `%${search}%` } },
        { remarks: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const rows = await db.MiscVoucher.findAll({
      where,
      include: [{ model: db.MiscVoucherItem, as: 'items' }],
      order: [['voucher_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching vouchers:', err);
    res.status(500).json({ error: 'Failed to fetch vouchers' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const voucher = await db.MiscVoucher.findByPk(req.params.id, {
      include: [{ model: db.MiscVoucherItem, as: 'items' }],
    });
    if (!voucher) return res.status(404).json({ error: 'Voucher not found' });
    res.json(voucher);
  } catch (err) {
    console.error('Error fetching voucher:', err);
    res.status(500).json({ error: 'Failed to fetch voucher' });
  }
};

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const body = req.body;
    const items = Array.isArray(body.items) ? body.items.filter((it) => it.description) : [];
    const total = round2(items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0));
    const voucher = await db.MiscVoucher.create({
      voucher_no: await generateVoucherNo(),
      voucher_date: body.voucher_date || new Date().toISOString().split('T')[0],
      voucher_type: body.voucher_type || 'Miscellaneous',
      party_name: body.party_name || null,
      remarks: body.remarks || null,
      total_amount: total,
      status: 'Draft',
      created_by: req.session?.user?.name || 'System',
    }, { transaction: t });
    for (const it of items) {
      await db.MiscVoucherItem.create({
        voucher_id: voucher.id,
        description: it.description,
        amount: Number(it.amount) || 0,
        remarks: it.remarks || null,
      }, { transaction: t });
    }
    await t.commit();
    const updated = await db.MiscVoucher.findByPk(voucher.id, { include: [{ model: db.MiscVoucherItem, as: 'items' }] });
    res.status(201).json(updated);
  } catch (err) {
    await t.rollback();
    console.error('Error creating voucher:', err);
    res.status(500).json({ error: 'Failed to create voucher' });
  }
};

exports.update = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const voucher = await db.MiscVoucher.findByPk(req.params.id, { transaction: t });
    if (!voucher) return res.status(404).json({ error: 'Voucher not found' });
    if (voucher.status === 'Approved') return res.status(400).json({ error: 'Cannot update an approved voucher' });

    const body = req.body;
    const items = Array.isArray(body.items) ? body.items.filter((it) => it.description) : [];
    const total = round2(items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0));
    await voucher.update({
      voucher_date: body.voucher_date || voucher.voucher_date,
      voucher_type: body.voucher_type || voucher.voucher_type,
      party_name: body.party_name || null,
      remarks: body.remarks || null,
      total_amount: total,
    }, { transaction: t });
    await db.MiscVoucherItem.destroy({ where: { voucher_id: voucher.id }, transaction: t });
    for (const it of items) {
      await db.MiscVoucherItem.create({
        voucher_id: voucher.id,
        description: it.description,
        amount: Number(it.amount) || 0,
        remarks: it.remarks || null,
      }, { transaction: t });
    }
    await t.commit();
    const updated = await db.MiscVoucher.findByPk(voucher.id, { include: [{ model: db.MiscVoucherItem, as: 'items' }] });
    res.json(updated);
  } catch (err) {
    await t.rollback();
    console.error('Error updating voucher:', err);
    res.status(500).json({ error: 'Failed to update voucher' });
  }
};

exports.approve = async (req, res) => {
  try {
    const voucher = await db.MiscVoucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ error: 'Voucher not found' });
    if (voucher.status !== 'Draft') return res.status(400).json({ error: 'Voucher already processed' });
    voucher.status = 'Approved';
    voucher.approved_by = req.body.approved_by || req.session?.user?.name || 'System';
    voucher.approved_date = new Date();
    await voucher.save();
    res.json(voucher);
  } catch (err) {
    console.error('Error approving voucher:', err);
    res.status(500).json({ error: 'Failed to approve voucher' });
  }
};

exports.remove = async (req, res) => {
  try {
    const voucher = await db.MiscVoucher.findByPk(req.params.id);
    if (!voucher) return res.status(404).json({ error: 'Voucher not found' });
    if (voucher.status === 'Approved') return res.status(400).json({ error: 'Cannot delete an approved voucher' });
    await db.MiscVoucherItem.destroy({ where: { voucher_id: voucher.id } });
    await voucher.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting voucher:', err);
    res.status(500).json({ error: 'Failed to delete voucher' });
  }
};
