const { Op } = require('sequelize');
const db = require('../../models/ERP');
const ItemMaster = db.ItemMaster;

const round2 = (v) => Number(Number(v || 0).toFixed(2));

async function generateDcNo(dcDateStr) {
  const count = await db.DeliveryChallan.count();
  const now = dcDateStr ? new Date(dcDateStr) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${count + 1}${time}`;
}

exports.getNextNumber = async (req, res) => {
  try {
    const dcNo = await generateDcNo();
    res.json({ dc_no: dcNo });
  } catch (err) {
    console.error("Error generating DC number:", err);
    res.status(500).json({ error: "Failed to generate DC number" });
  }
};

const adjustStock = async (items, sign) => {
  for (const it of items) {
    if (!it.item_id) continue;
    const item = await ItemMaster.findByPk(it.item_id);
    if (!item) continue;
    const delta = round2(parseFloat(it.quantity) * sign);
    const newStock = Math.max(0, round2(parseFloat(item.current_stock || 0) + delta));
    await item.update({ current_stock: newStock });
  }
};

exports.getList = async (req, res) => {
  try {
    const { search, status, returnable, dc_type, year, date_from, date_to } = req.query;
    const where = {};
    if (status) where.status = status;
    if (dc_type) where.dc_type = dc_type;
    if (returnable === 'true') where.returnable = true;
    if (returnable === 'false') where.returnable = false;
    if (date_from && date_to) {
      where.dc_date = { [Op.between]: [date_from, date_to] };
    } else if (date_from) {
      where.dc_date = { [Op.gte]: date_from };
    } else if (date_to) {
      where.dc_date = { [Op.lte]: date_to };
    }
    if (year) {
      where[Op.and] = [
        db.sequelize.where(db.sequelize.fn('EXTRACT', db.sequelize.literal('YEAR FROM "dc_date"')), year),
      ];
    }
    if (search) where[Op.or] = [{ dc_no: { [Op.iLike]: `%${search}%` } }, { party_name: { [Op.iLike]: `%${search}%` } }];
    const rows = await db.DeliveryChallan.findAll({ where, order: [['dc_date', 'DESC']] });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching DC list:', err);
    res.status(500).json({ error: 'Failed to fetch delivery challans' });
  }
};

exports.getPendingBilling = async (req, res) => {
  try {
    const { year } = req.query;
    const where = { status: 'Issued', bill_no: null };
    if (year) {
      where[Op.and] = [
        db.sequelize.where(db.sequelize.fn('EXTRACT', db.sequelize.literal('YEAR FROM "dc_date"')), year),
      ];
    }
    const rows = await db.DeliveryChallan.findAll({
      where,
      include: [{ model: db.DeliveryChallanItem, as: 'items' }],
      order: [['dc_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching pending DC billing:', err);
    res.status(500).json({ error: 'Failed to fetch pending DC billing' });
  }
};

exports.billDc = async (req, res) => {
  try {
    const { ids, bill_no, bill_date } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'DC IDs required' });
    const bDate = bill_date || new Date().toISOString().split('T')[0];
    await db.DeliveryChallan.update(
      { bill_no, bill_date: bDate, status: 'Billed' },
      { where: { id: { [Op.in]: ids } } }
    );
    res.json({ message: `Billed ${ids.length} DC(s)` });
  } catch (err) {
    console.error('Error billing DCs:', err);
    res.status(500).json({ error: 'Failed to bill DCs' });
  }
};

exports.getByParty = async (req, res) => {
  try {
    const rows = await db.DeliveryChallan.findAll({
      where: { party_id: req.params.partyId },
      include: [{ model: db.DeliveryChallanItem, as: 'items' }],
      order: [['dc_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching DCs by party:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const dc = await db.DeliveryChallan.findByPk(req.params.id, {
      include: [{
        model: db.DeliveryChallanItem, as: 'items',
        include: [{ model: ItemMaster, as: 'item', include: [{ model: db.Unit, as: 'unit' }] }],
      }],
    });
    if (!dc) return res.status(404).json({ error: 'Delivery Challan not found' });
    res.json(dc);
  } catch (err) {
    console.error('Error fetching DC:', err);
    res.status(500).json({ error: 'Failed to fetch delivery challan' });
  }
};

exports.create = async (req, res) => {
  try {
    const body = req.body;
    const dc_no = await generateDcNo(body.dc_date);
    const dc = await db.DeliveryChallan.create({
      dc_no,
      dc_date: body.dc_date,
      party_id: body.party_id || null,
      party_name: body.party_name || null,
      returnable: body.dc_type === 'S' ? Boolean(body.returnable) : false,
      dc_type: body.dc_type || 'S',
      expected_return_date: body.expected_return_date || null,
      reference_no: body.reference_no || null,
      vehicle_no: body.vehicle_no || null,
      driver_name: body.driver_name || null,
      department: body.department || null,
      requested_by: body.requested_by || null,
      prepared_by: body.prepared_by || null,
      req_date: body.req_date || null,
      remarks: body.remarks || null,
      status: 'Draft',
    });
    if (Array.isArray(body.items)) {
      for (const it of body.items) {
        await db.DeliveryChallanItem.create({
          dc_id: dc.id,
          item_id: it.item_id || null,
          item_code: it.item_code || null,
          item_name: it.item_name,
          item_grp: it.item_grp || null,
          wo_no: it.wo_no || null,
          hs_code: it.hs_code || null,
          quantity: it.quantity || 0,
          rate: it.rate || null,
          unit_id: it.unit_id || null,
          unit: it.unit || null,
          returned_qty: 0,
          remarks: it.remarks || null,
          req_date: it.req_date || null,
        });
      }
    }
    res.status(201).json(dc);
  } catch (err) {
    console.error('Error creating DC:', err);
    res.status(500).json({ error: 'Failed to create delivery challan' });
  }
};

exports.update = async (req, res) => {
  try {
    const dc = await db.DeliveryChallan.findByPk(req.params.id);
    if (!dc) return res.status(404).json({ error: 'Delivery Challan not found' });
    if (dc.status !== 'Draft') return res.status(400).json({ error: 'Only draft challans can be edited' });
    const body = req.body;
    await dc.update({
      dc_date: body.dc_date,
      party_id: body.party_id || null,
      party_name: body.party_name || null,
      returnable: body.dc_type === 'S' ? Boolean(body.returnable) : false,
      dc_type: body.dc_type || dc.dc_type,
      expected_return_date: body.expected_return_date || null,
      reference_no: body.reference_no || null,
      vehicle_no: body.vehicle_no || null,
      driver_name: body.driver_name || null,
      department: body.department || null,
      requested_by: body.requested_by || null,
      prepared_by: body.prepared_by || dc.prepared_by || null,
      req_date: body.req_date || null,
      remarks: body.remarks || null,
    });
    await db.DeliveryChallanItem.destroy({ where: { dc_id: dc.id } });
    if (Array.isArray(body.items)) {
      for (const it of body.items) {
        await db.DeliveryChallanItem.create({
          dc_id: dc.id,
          item_id: it.item_id || null,
          item_code: it.item_code || null,
          item_name: it.item_name,
          item_grp: it.item_grp || null,
          wo_no: it.wo_no || null,
          hs_code: it.hs_code || null,
          quantity: it.quantity || 0,
          rate: it.rate || null,
          unit_id: it.unit_id || null,
          unit: it.unit || null,
          returned_qty: 0,
          remarks: it.remarks || null,
          req_date: it.req_date || null,
        });
      }
    }
    res.json(dc);
  } catch (err) {
    console.error('Error updating DC:', err);
    res.status(500).json({ error: 'Failed to update delivery challan' });
  }
};

exports.issue = async (req, res) => {
  try {
    const dc = await db.DeliveryChallan.findByPk(req.params.id, {
      include: [{ model: db.DeliveryChallanItem, as: 'items' }],
    });
    if (!dc) return res.status(404).json({ error: 'Delivery Challan not found' });
    if (dc.status !== 'Draft') return res.status(400).json({ error: 'Challan already issued' });
    await adjustStock(dc.items, -1);
    dc.status = 'Issued';
    await dc.save();
    res.json(dc);
  } catch (err) {
    console.error('Error issuing DC:', err);
    res.status(500).json({ error: 'Failed to issue delivery challan' });
  }
};

exports.returnDc = async (req, res) => {
  try {
    const dc = await db.DeliveryChallan.findByPk(req.params.id, {
      include: [{ model: db.DeliveryChallanItem, as: 'items' }],
    });
    if (!dc) return res.status(404).json({ error: 'Delivery Challan not found' });
    if (dc.dc_type !== 'S') return res.status(400).json({ error: 'Only Sale on Approval challans can be returned' });
    if (dc.status !== 'Issued') return res.status(400).json({ error: 'Only issued challans can be returned' });
    const returns = req.body.items || [];
    for (const r of returns) {
      const it = dc.items.find((x) => x.id === r.id);
      if (!it) continue;
      const returned = Math.min(parseFloat(r.returned_qty) || 0, parseFloat(it.quantity) - parseFloat(it.returned_qty || 0));
      if (returned > 0) {
        const item = await ItemMaster.findByPk(it.item_id);
        if (item) {
          const newStock = Math.max(0, round2(parseFloat(item.current_stock || 0) + returned));
          await item.update({ current_stock: newStock });
        }
        await it.update({ returned_qty: round2(parseFloat(it.returned_qty || 0) + returned) });
      }
    }
    const allReturned = dc.items.every((x) => parseFloat(x.returned_qty || 0) >= parseFloat(x.quantity));
    dc.status = allReturned ? 'Returned' : 'Issued';
    await dc.save();
    res.json(dc);
  } catch (err) {
    console.error('Error returning DC:', err);
    res.status(500).json({ error: 'Failed to process return' });
  }
};

exports.remove = async (req, res) => {
  try {
    const dc = await db.DeliveryChallan.findByPk(req.params.id);
    if (!dc) return res.status(404).json({ error: 'Delivery Challan not found' });
    if (dc.status === 'Issued') return res.status(400).json({ error: 'Cannot delete an issued challan' });
    await db.DeliveryChallanItem.destroy({ where: { dc_id: dc.id } });
    await dc.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting DC:', err);
    res.status(500).json({ error: 'Failed to delete delivery challan' });
  }
};
