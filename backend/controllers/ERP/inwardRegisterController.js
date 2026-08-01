const { Op } = require('sequelize');
const db = require('../../models/ERP');
const DeliveryChallan = db.DeliveryChallan;
const DeliveryChallanItem = db.DeliveryChallanItem;
const InwardRegister = db.InwardRegister;
const InwardRegisterItem = db.InwardRegisterItem;
const ItemMaster = db.ItemMaster;
const SupplierMaster = db.SupplierMaster;
const { postMovement, reverseMovements, getDefaultWarehouse, lockStock, negativeStockAllowed, REF_TYPES } = require('../../utils/stockService');

const round2 = (v) => Number(Number(v || 0).toFixed(2));

async function generateIrNo() {
  const [rows] = await db.sequelize.query('SELECT COALESCE(MAX(CAST(ir_no AS INTEGER)), 0) AS max_no FROM t_inward_register');
  return String(Number(rows[0]?.max_no || 0) + 1);
}

async function getPendingDCs(req, res) {
  try {
    const { search, party_id, dc_type } = req.query;
    const where = { status: 'Approved' };
    if (dc_type) where.dc_type = dc_type;
    if (party_id) where.party_id = party_id;
    if (search) where[Op.or] = [{ dc_no: { [Op.iLike]: `%${search}%` } }, { party_name: { [Op.iLike]: `%${search}%` } }];

    const dcs = await DeliveryChallan.findAll({
      where,
      include: [{
        model: DeliveryChallanItem,
        as: 'items',
        include: [{ model: ItemMaster, as: 'item', attributes: ['id', 'item_code', 'item_name', 'unit'] }],
      }],
      order: [['dc_date', 'DESC']],
    });

    // For each DC, calculate how much has already been received
    for (const dc of dcs) {
      const receivedMap = {};
      const inwardItems = await InwardRegisterItem.findAll({
        where: { dc_id: dc.id },
        attributes: ['dc_item_id', [db.sequelize.fn('SUM', db.sequelize.col('qty_supplied')), 'total_received']],
        group: ['dc_item_id'],
      });
      inwardItems.forEach((it) => { receivedMap[it.dc_item_id] = Number(it.dataValues.total_received || 0); });

      dc.items.forEach((item) => {
        const received = receivedMap[item.id] || 0;
        item.dataValues.qty_received = received;
        item.dataValues.qty_pending = Number(item.quantity) - received;
      });

      // Filter out fully received DCs
      const hasPending = dc.items.some((it) => it.dataValues.qty_pending > 0);
      dc.dataValues.has_pending = hasPending;
    }

    res.json(dcs.filter((dc) => dc.dataValues.has_pending));
  } catch (err) {
    console.error('Error fetching pending DCs:', err);
    res.status(500).json({ error: 'Failed to fetch pending DCs' });
  }
}

exports.getPendingDCs = getPendingDCs;

exports.getNextNumber = async (req, res) => {
  try {
    const [rows] = await db.sequelize.query('SELECT COALESCE(MAX(CAST(ir_no AS INTEGER)), 0) AS max_no FROM t_inward_register');
    const last = Number(rows[0]?.max_no || 0);
    res.json({ ir_no: String(last + 1), last_number: String(last) });
  } catch (err) {
    console.error('Error generating IR number:', err);
    res.status(500).json({ error: 'Failed to generate IR number' });
  }
};

exports.getList = async (req, res) => {
  try {
    const { search, status, party_id, date_from, date_to, year } = req.query;
    const where = {};
    if (status) where.status = status;
    if (party_id) where.party_id = party_id;
    if (date_from && date_to) {
      const toEnd = new Date(new Date(date_to).getTime() + 86400000).toISOString().slice(0, 10);
      where.ir_date = { [Op.between]: [date_from, toEnd] };
    } else if (date_from) {
      where.ir_date = { [Op.gte]: date_from };
    } else if (date_to) {
      where.ir_date = { [Op.lte]: date_to };
    }
    if (year) {
      where[Op.and] = [db.sequelize.where(db.sequelize.fn('EXTRACT', db.sequelize.literal('YEAR FROM "ir_date"')), year)];
    }
    if (search) where[Op.or] = [{ ir_no: { [Op.iLike]: `%${search}%` } }, { party_name: { [Op.iLike]: `%${search}%` } }];

    const rows = await InwardRegister.findAll({
      where,
      include: [
        { model: InwardRegisterItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
      ],
      order: [['ir_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching IR list:', err);
    res.status(500).json({ error: 'Failed to fetch inward registers' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const ir = await InwardRegister.findByPk(req.params.id, {
      include: [
        { model: InwardRegisterItem, as: 'items', include: [{ model: ItemMaster, as: 'item' }] },
        { model: SupplierMaster, as: 'supplier' },
        { model: DeliveryChallan, as: 'deliveryChallans' },
      ],
    });
    if (!ir) return res.status(404).json({ error: 'Inward Register not found' });
    res.json(ir);
  } catch (err) {
    console.error('Error fetching IR:', err);
    res.status(500).json({ error: 'Failed to fetch inward register' });
  }
};

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const body = req.body;
    const ir = await InwardRegister.create({
      ir_no: null,
      ir_date: body.ir_date,
      party_id: body.party_id || null,
      party_name: body.party_name || null,
      vehicle_no: body.vehicle_no || null,
      driver_name: body.driver_name || null,
      department: body.department || null,
      requested_by: body.requested_by || null,
      prepared_by: body.prepared_by || null,
      remarks: body.remarks || null,
      status: 'Draft',
    }, { transaction: t });

    if (Array.isArray(body.items)) {
      for (const it of body.items) {
        await InwardRegisterItem.create({
          ir_id: ir.id,
          dc_id: it.dc_id || null,
          dc_item_id: it.dc_item_id || null,
          item_id: it.item_id || null,
          item_code: it.item_code || null,
          item_name: it.item_name,
          uom: it.uom || null,
          unit_id: it.unit_id || null,
          dc_qty: it.dc_qty || 0,
          qty_supplied: it.qty_supplied || 0,
          rate: it.rate || null,
          remarks: it.remarks || null,
        }, { transaction: t });
      }
    }

    // Link DCs
    if (Array.isArray(body.dc_ids)) {
      const dcs = await DeliveryChallan.findAll({ where: { id: { [Op.in]: body.dc_ids } }, transaction: t });
      await ir.setDeliveryChallans(dcs, { transaction: t });
    }

    await t.commit();
    const created = await InwardRegister.findByPk(ir.id, {
      include: [{ model: InwardRegisterItem, as: 'items' }],
    });
    res.status(201).json(created);
  } catch (err) {
    await t.rollback();
    console.error('Error creating IR:', err);
    res.status(500).json({ error: 'Failed to create inward register' });
  }
};

exports.update = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const ir = await InwardRegister.findByPk(req.params.id, { transaction: t });
    if (!ir) return res.status(404).json({ error: 'Inward Register not found' });
    if (ir.status !== 'Draft') return res.status(400).json({ error: 'Only draft IRs can be edited' });

    const body = req.body;
    await ir.update({
      ir_date: body.ir_date,
      party_id: body.party_id || null,
      party_name: body.party_name || null,
      vehicle_no: body.vehicle_no || null,
      driver_name: body.driver_name || null,
      department: body.department || null,
      requested_by: body.requested_by || null,
      prepared_by: body.prepared_by || ir.prepared_by || null,
      remarks: body.remarks || null,
    }, { transaction: t });

    await InwardRegisterItem.destroy({ where: { ir_id: ir.id }, transaction: t });
    if (Array.isArray(body.items)) {
      for (const it of body.items) {
        await InwardRegisterItem.create({
          ir_id: ir.id,
          dc_id: it.dc_id || null,
          dc_item_id: it.dc_item_id || null,
          item_id: it.item_id || null,
          item_code: it.item_code || null,
          item_name: it.item_name,
          uom: it.uom || null,
          unit_id: it.unit_id || null,
          dc_qty: it.dc_qty || 0,
          qty_supplied: it.qty_supplied || 0,
          rate: it.rate || null,
          remarks: it.remarks || null,
        }, { transaction: t });
      }
    }

    if (Array.isArray(body.dc_ids)) {
      const dcs = await DeliveryChallan.findAll({ where: { id: { [Op.in]: body.dc_ids } }, transaction: t });
      await ir.setDeliveryChallans(dcs, { transaction: t });
    }

    await t.commit();
    const updated = await InwardRegister.findByPk(ir.id, {
      include: [{ model: InwardRegisterItem, as: 'items' }],
    });
    res.json(updated);
  } catch (err) {
    await t.rollback();
    console.error('Error updating IR:', err);
    res.status(500).json({ error: 'Failed to update inward register' });
  }
};

async function postIrStock(items, doc, t, user) {
  const wh = await getDefaultWarehouse();
  const negAllowed = await negativeStockAllowed();
  for (const it of items) {
    if (!it.item_id) continue;
    const qty = Number(it.qty_supplied || 0);
    if (qty <= 0) continue;
    if (!negAllowed) {
      const locked = await lockStock(it.item_id, t);
      if (Number(locked?.current_stock || 0) + qty < qty) {
        throw new Error(`Insufficient stock for ${it.item_code || it.item_name || it.item_id}`);
      }
    }
    const item = await ItemMaster.findByPk(it.item_id, { transaction: t });
    if (!item) continue;
    await postMovement(
      {
        item_id: it.item_id,
        warehouse_id: it.warehouse_id || wh?.id || null,
        batch_id: it.batch_id || null,
        ledger_date: doc.ir_date || new Date(),
        ref_type: REF_TYPES.INWARD_REGISTER,
        doc_no: doc.ir_no,
        ref_no: doc.ir_no,
        reference: doc.party_name || null,
        qty_in: qty,
        qty_out: 0,
        unit_cost: Number(item.moving_average_cost || 0),
        remarks: it.remarks || `IR ${doc.ir_no}`,
        user,
      },
      t
    );
  }
}

exports.approve = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const ir = await InwardRegister.findByPk(req.params.id, {
      include: [{ model: InwardRegisterItem, as: 'items' }],
      transaction: t,
    });
    if (!ir) return res.status(404).json({ error: 'Inward Register not found' });
    if (ir.status !== 'Draft') return res.status(400).json({ error: 'IR already approved' });

    const user = req.session?.user?.name || 'System';
    ir.status = 'Approved';
    ir.approved_by = req.body.approved_by || null;
    if (ir.ir_no === null || ir.ir_no === undefined || ir.ir_no === '') {
      ir.ir_no = await generateIrNo();
    }
    ir.approved_date = new Date();
    ir.ir_date = new Date();

    await postIrStock(ir.items, ir, t, user);
    await ir.save({ transaction: t });
    await t.commit();
    res.json(ir);
  } catch (err) {
    await t.rollback();
    console.error('Error approving IR:', err);
    res.status(500).json({ error: err.message || 'Failed to approve inward register' });
  }
};

exports.cancel = async (req, res) => {
  const cancelRemarks = req.body.cancel_remarks;
  if (!cancelRemarks || !String(cancelRemarks).trim()) {
    return res.status(400).json({ error: 'Cancel remarks are required' });
  }
  const t = await db.sequelize.transaction();
  try {
    const ir = await InwardRegister.findByPk(req.params.id, {
      include: [{ model: InwardRegisterItem, as: 'items' }],
      transaction: t,
    });
    if (!ir) return res.status(404).json({ error: 'Inward Register not found' });
    if (ir.status === 'Cancelled') return res.status(400).json({ error: 'IR already cancelled' });
    if (!['Draft', 'Approved'].includes(ir.status)) return res.status(400).json({ error: 'Only draft or approved IRs can be cancelled' });

    if (ir.status === 'Approved') {
      const user = req.session?.user?.name || 'System';
      const itemIds = [...new Set(ir.items.map((x) => x.item_id).filter(Boolean))];
      for (const itemId of itemIds) {
        await reverseMovements(
          { item_id: itemId, ref_type: REF_TYPES.INWARD_REGISTER, ref_no: ir.ir_no, user },
          t
        );
      }
    }
    ir.status = 'Cancelled';
    ir.cancel_remarks = req.body.cancel_remarks || null;
    ir.cancel_by = req.body.cancel_by || null;
    ir.cancel_date = req.body.cancel_date || new Date();
    await ir.save({ transaction: t });
    await t.commit();
    res.json(ir);
  } catch (err) {
    await t.rollback();
    console.error('Error cancelling IR:', err);
    res.status(500).json({ error: 'Failed to cancel inward register' });
  }
};

exports.remove = async (req, res) => {
  try {
    const ir = await InwardRegister.findByPk(req.params.id);
    if (!ir) return res.status(404).json({ error: 'Inward Register not found' });
    if (ir.status === 'Approved') return res.status(400).json({ error: 'Cannot delete an approved IR' });
    await InwardRegisterItem.destroy({ where: { ir_id: ir.id } });
    await ir.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting IR:', err);
    res.status(500).json({ error: 'Failed to delete inward register' });
  }
};