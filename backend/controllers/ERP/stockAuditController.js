const db = require('../../models/ERP');
const { Op } = require('sequelize');

const StockAudit = db.StockAudit;
const StockAuditItem = db.StockAuditItem;
const ItemMaster = db.ItemMaster;

exports.getList = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { audit_no: { [Op.iLike]: `%${search}%` } },
        { auditor: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const data = await StockAudit.findAll({
      where,
      order: [['created_date', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching stock audits:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await StockAudit.findByPk(req.params.id, {
      include: [{ model: StockAuditItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.create = async (req, res) => {
  try {
    let { items, ...header } = req.body;
    if (!header.audit_no) {
      const seq = await StockAudit.count() + 1;
      header.audit_no = `AUD-${String(seq).padStart(4, '0')}`;
    }
    if (items && items.length > 0) {
      for (const it of items) {
        it.variance_qty = (parseFloat(it.physical_qty || 0) - parseFloat(it.system_qty || 0)).toFixed(2);
      }
    }
    const doc = await StockAudit.create(header);
    if (items && items.length > 0) {
      const rows = items.map((it) => ({ ...it, audit_id: doc.id }));
      await StockAuditItem.bulkCreate(rows);
    }
    const result = await StockAudit.findByPk(doc.id, {
      include: [{ model: StockAuditItem, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating stock audit:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await StockAudit.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    let { items, ...header } = req.body;
    if (items && items.length > 0) {
      for (const it of items) {
        it.variance_qty = (parseFloat(it.physical_qty || 0) - parseFloat(it.system_qty || 0)).toFixed(2);
      }
    }
    await doc.update(header);
    await StockAuditItem.destroy({ where: { audit_id: doc.id } });
    if (items && items.length > 0) {
      const rows = items.map((it) => ({ ...it, audit_id: doc.id }));
      await StockAuditItem.bulkCreate(rows);
    }
    const result = await StockAudit.findByPk(doc.id, {
      include: [{ model: StockAuditItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    console.error('Error updating stock audit:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
};

exports.approve = async (req, res) => {
  try {
    const doc = await StockAudit.findByPk(req.params.id, {
      include: [{ model: StockAuditItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await doc.update({ status: 'Approved' });
    for (const it of doc.items) {
      const variance = parseFloat(it.variance_qty || 0);
      if (variance !== 0 && it.item_id) {
        const item = await ItemMaster.findByPk(it.item_id);
        if (item) {
          await item.update({
            current_stock: Math.max(0, parseFloat(item.current_stock || 0) + variance),
          });
        }
      }
    }
    res.json(doc);
  } catch (err) {
    console.error('Error approving stock audit:', err);
    res.status(500).json({ error: 'Failed to approve' });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await StockAudit.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await StockAuditItem.destroy({ where: { audit_id: doc.id } });
    await doc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
};
