const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { postMovement, reverseMovements, getDefaultWarehouse, REF_TYPES } = require('../../utils/stockService');

const sequelize = db.sequelize;
const MaterialReturn = db.MaterialReturn;
const MaterialReturnItem = db.MaterialReturnItem;
const ItemMaster = db.ItemMaster;

// return_type: 'To Store' → goods come back in; otherwise goods go out.
function movementDirection(returnType, qty) {
  if (returnType === 'To Store') return { qty_in: qty, qty_out: 0 };
  return { qty_in: 0, qty_out: qty };
}

exports.getList = async (req, res) => {
  try {
    const { search, status, return_type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (return_type) where.return_type = return_type;
    if (search) {
      where[Op.or] = [
        { return_no: { [Op.iLike]: `%${search}%` } },
        { party_name: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const data = await MaterialReturn.findAll({
      where,
      order: [['created_date', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching material returns:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await MaterialReturn.findByPk(req.params.id, {
      include: [{ model: MaterialReturnItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { items, ...header } = req.body;
    if (!header.return_no) {
      const seq = await MaterialReturn.count() + 1;
      header.return_no = `MRN-${String(seq).padStart(4, '0')}`;
    }
    const doc = await MaterialReturn.create(header, { transaction: t });
    if (items && items.length > 0) {
      const rows = items.map((it) => ({ ...it, return_id: doc.id }));
      await MaterialReturnItem.bulkCreate(rows, { transaction: t });

      const wh = await getDefaultWarehouse();
      for (const it of items) {
        if (!it.item_id) continue;
        const qty = Number(it.quantity || 0);
        if (qty === 0) continue;
        const item = await ItemMaster.findByPk(it.item_id, { transaction: t });
        if (!item) continue;
        const dir = movementDirection(header.return_type, qty);
        await postMovement(
          {
            item_id: it.item_id,
            warehouse_id: it.warehouse_id || wh?.id || null,
            batch_id: it.batch_id || null,
            ledger_date: doc.return_date || new Date(),
            ref_type: REF_TYPES.MATERIAL_RETURN,
            doc_no: doc.return_no,
            ref_no: doc.return_no,
            reference: header.party_name || header.reference_no || null,
            ...dir,
            unit_cost: Number(item.moving_average_cost || 0),
            remarks: it.remarks || `${header.return_type || ''} (${header.reference_type || ''})`.trim(),
            user: req.session?.user?.name || 'System',
          },
          t
        );
      }
    }
    await t.commit();
    const result = await MaterialReturn.findByPk(doc.id, {
      include: [{ model: MaterialReturnItem, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) {
    await t.rollback();
    console.error('Error creating material return:', err);
    res.status(500).json({ error: err.message || 'Failed to create' });
  }
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const doc = await MaterialReturn.findByPk(req.params.id, {
      include: [{ model: MaterialReturnItem, as: 'items' }],
      transaction: t,
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.status !== 'Draft') return res.status(400).json({ error: 'Only draft returns can be edited' });

    let { items, ...header } = req.body;

    // Reverse previously posted ledger rows for this return
    if (doc.items?.length) {
      const itemIds = [...new Set(doc.items.map((x) => x.item_id).filter(Boolean))];
      for (const itemId of itemIds) {
        await reverseMovements(
          { item_id: itemId, ref_type: REF_TYPES.MATERIAL_RETURN, ref_no: doc.return_no, user: req.session?.user?.name || 'System' },
          t
        );
      }
    }

    await doc.update(header, { transaction: t });

    if (items) {
      await MaterialReturnItem.destroy({ where: { return_id: doc.id }, transaction: t });
      const rows = items.map((it) => ({ ...it, return_id: doc.id }));
      await MaterialReturnItem.bulkCreate(rows, { transaction: t });

      const wh = await getDefaultWarehouse();
      for (const it of items) {
        if (!it.item_id) continue;
        const qty = Number(it.quantity || 0);
        if (qty === 0) continue;
        const item = await ItemMaster.findByPk(it.item_id, { transaction: t });
        if (!item) continue;
        const dir = movementDirection(header.return_type || doc.return_type, qty);
        await postMovement(
          {
            item_id: it.item_id,
            warehouse_id: it.warehouse_id || wh?.id || null,
            batch_id: it.batch_id || null,
            ledger_date: doc.return_date || new Date(),
            ref_type: REF_TYPES.MATERIAL_RETURN,
            doc_no: doc.return_no,
            ref_no: doc.return_no,
            reference: header.party_name || header.reference_no || null,
            ...dir,
            unit_cost: Number(item.moving_average_cost || 0),
            remarks: it.remarks || `${header.return_type || ''} (${header.reference_type || ''})`.trim(),
            user: req.session?.user?.name || 'System',
          },
          t
        );
      }
    }

    await t.commit();
    const result = await MaterialReturn.findByPk(doc.id, {
      include: [{ model: MaterialReturnItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    await t.rollback();
    console.error('Error updating material return:', err);
    res.status(500).json({ error: err.message || 'Failed to update' });
  }
};

exports.delete = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const doc = await MaterialReturn.findByPk(req.params.id, {
      include: [{ model: MaterialReturnItem, as: 'items' }],
      transaction: t,
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.items?.length) {
      const itemIds = [...new Set(doc.items.map((x) => x.item_id).filter(Boolean))];
      for (const itemId of itemIds) {
        await reverseMovements(
          { item_id: itemId, ref_type: REF_TYPES.MATERIAL_RETURN, ref_no: doc.return_no, user: req.session?.user?.name || 'System' },
          t
        );
      }
    }
    await MaterialReturnItem.destroy({ where: { return_id: doc.id }, transaction: t });
    await doc.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Deleted' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: 'Failed to delete' });
  }
};
