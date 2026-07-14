const db = require('../../models/ERP');
const { Op } = require('sequelize');

const MaterialIssue = db.MaterialIssue;
const MaterialIssueItem = db.MaterialIssueItem;
const MaterialRequisition = db.MaterialRequisition;
const MaterialRequisitionItem = db.MaterialRequisitionItem;
const ItemMaster = db.ItemMaster;

exports.getList = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { issue_no: { [Op.iLike]: `%${search}%` } },
        { issued_to: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const data = await MaterialIssue.findAll({
      where,
      include: [
        { model: MaterialIssueItem, as: 'items' },
        { model: MaterialRequisition, as: 'requisition', attributes: ['id', 'req_no'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching material issues:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await MaterialIssue.findByPk(req.params.id, {
      include: [
        { model: MaterialIssueItem, as: 'items' },
        { model: MaterialRequisition, as: 'requisition' },
      ],
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
    if (!header.issue_no) {
      const seq = await MaterialIssue.count() + 1;
      header.issue_no = `MIS-${String(seq).padStart(4, '0')}`;
    }
    const doc = await MaterialIssue.create(header);
    if (items && items.length > 0) {
      const rows = items.map((it) => ({ ...it, issue_id: doc.id }));
      await MaterialIssueItem.bulkCreate(rows);

      // Update MR item issued quantities and update stock
      for (const it of items) {
        if (it.req_item_id) {
          const mrItem = await MaterialRequisitionItem.findByPk(it.req_item_id);
          if (mrItem) {
            const newIssued = parseFloat(mrItem.issued_quantity || 0) + parseFloat(it.quantity);
            const newPending = Math.max(0, parseFloat(mrItem.quantity) - newIssued);
            await mrItem.update({ issued_quantity: newIssued, pending_quantity: newPending });
          }
        }
        // Decrement stock
        if (it.item_id) {
          const item = await ItemMaster.findByPk(it.item_id);
          if (item) {
            const newStock = Math.max(0, parseFloat(item.current_stock || 0) - parseFloat(it.quantity));
            await item.update({ current_stock: newStock });
          }
        }
      }
    }

    // Update MR header status
    if (header.req_id) {
      const mr = await MaterialRequisition.findByPk(header.req_id, {
        include: [{ model: MaterialRequisitionItem, as: 'items' }],
      });
      if (mr) {
        const allIssued = mr.items.every((i) => parseFloat(i.pending_quantity || 0) <= 0);
        const anyIssued = mr.items.some((i) => parseFloat(i.issued_quantity || 0) > 0);
        if (allIssued) await mr.update({ status: 'Issued' });
        else if (anyIssued) await mr.update({ status: 'Partially Issued' });
      }
    }

    const result = await MaterialIssue.findByPk(doc.id, {
      include: [{ model: MaterialIssueItem, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating material issue:', err);
    res.status(500).json({ error: 'Failed to create' });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await MaterialIssue.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    await MaterialIssueItem.destroy({ where: { issue_id: doc.id } });
    await doc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
};
