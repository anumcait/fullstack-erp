const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { generateDocNumber } = require('../../utils/docNumber');

const GRN = db.GRN;
const GRNItem = db.GRNItem;
const PurchaseOrder = db.PurchaseOrder;
const PurchaseOrderItem = db.PurchaseOrderItem;
const SupplierMaster = db.SupplierMaster;
const PurchaseSettings = db.PurchaseSettings;
const ItemMaster = db.ItemMaster;

// Post purchase cost (moving average) and receipt into stock for a GRN.
// Runs once per GRN (guarded by cost_posted) so it is safe to call on both
// GRN entry and later GRN billing without double-counting.
async function postGRNCost(grnId) {
  const grn = await GRN.findByPk(grnId, { include: [{ model: GRNItem, as: 'items' }] });
  if (!grn || grn.cost_posted) return;
  for (const it of grn.items) {
    if (!it.item_id || !(Number(it.accepted_qty) > 0) || !(Number(it.rate) > 0)) continue;
    const item = await ItemMaster.findByPk(it.item_id);
    if (!item) continue;
    const stock = Number(item.current_stock || 0);
    const oldRate = Number(item.rate || 0);
    const qty = Number(it.accepted_qty);
    const newRate = Number(it.rate);
    const totalStock = stock + qty;
    const avg = totalStock > 0 ? (stock * oldRate + qty * newRate) / totalStock : newRate;
    await item.update({ rate: Number(avg.toFixed(2)), current_stock: Number((stock + qty).toFixed(2)) });
  }
  await grn.update({ cost_posted: true });
}

exports.getGRNs = async (req, res) => {
  try {
    const { search, status, po_id, supplier_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (po_id) where.po_id = po_id;
    if (supplier_id) where.supplier_id = supplier_id;
    if (search) {
      where[Op.or] = [
        { grn_no: { [Op.iLike]: `%${search}%` } },
        { invoice_no: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const grns = await GRN.findAll({
      where,
      include: [
        { model: GRNItem, as: 'items' },
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'po_no', 'po_date'] },
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
      ],
      order: [['created_date', 'DESC']],
    });
    res.json(grns);
  } catch (err) {
    console.error('Error fetching GRNs:', err);
    res.status(500).json({ error: 'Failed to fetch GRNs' });
  }
};

exports.getGRN = async (req, res) => {
  try {
    const grn = await GRN.findByPk(req.params.id, {
      include: [
        { model: GRNItem, as: 'items' },
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: SupplierMaster, as: 'supplier' },
      ],
    });
    if (!grn) return res.status(404).json({ error: 'GRN not found' });
    res.json(grn);
  } catch (err) {
    console.error('Error fetching GRN:', err);
    res.status(500).json({ error: 'Failed to fetch GRN' });
  }
};

exports.createGRN = async (req, res) => {
  try {
    let { items, ...header } = req.body;

    if (!header.grn_no) {
      const settings = await PurchaseSettings.findByPk(1);
      if (settings?.auto_generate_grn) {
        header.grn_no = await generateDocNumber('GRN', 'grn_prefix', 'grn_no', settings);
      } else {
        return res.status(400).json({ error: 'GRN number is required. Enable auto-generation in Settings.' });
      }
    }

    if (!header.po_id) return res.status(400).json({ error: 'PO reference is required' });

    const existing = await GRN.findOne({ where: { grn_no: header.grn_no } });
    if (existing) return res.status(409).json({ error: `GRN '${header.grn_no}' already exists` });

    const grn = await GRN.create(header);
    if (items && items.length > 0) {
      const itemRows = items.map((it) => ({ ...it, grn_id: grn.id }));
      await GRNItem.bulkCreate(itemRows);

      // Update PO item received quantities
      for (const it of items) {
        if (it.po_item_id) {
          const poItem = await PurchaseOrderItem.findByPk(it.po_item_id);
          if (poItem) {
            const newReceived = parseFloat(poItem.received_quantity || 0) + parseFloat(it.accepted_qty || 0);
            await poItem.update({ received_quantity: newReceived });
          }
        }
      }
    }

    const result = await GRN.findByPk(grn.id, {
      include: [
        { model: GRNItem, as: 'items' },
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'po_no'] },
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
      ],
    });
    await postGRNCost(grn.id);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating GRN:', err);
    res.status(500).json({ error: 'Failed to create GRN' });
  }
};

exports.updateGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const grn = await GRN.findByPk(id);
    if (!grn) return res.status(404).json({ error: 'GRN not found' });

    const { items, ...header } = req.body;
    await grn.update(header);

    if (items) {
      await GRNItem.destroy({ where: { grn_id: id } });
      const itemRows = items.map((it) => ({ ...it, grn_id: id }));
      await GRNItem.bulkCreate(itemRows);
    }

    const result = await GRN.findByPk(id, {
      include: [
        { model: GRNItem, as: 'items' },
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: SupplierMaster, as: 'supplier' },
      ],
    });
    if (!grn.cost_posted) await postGRNCost(id);
    res.json(result);
  } catch (err) {
    console.error('Error updating GRN:', err);
    res.status(500).json({ error: 'Failed to update GRN' });
  }
};

exports.approveGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_by, remarks } = req.body;
    const grn = await GRN.findByPk(id);
    if (!grn) return res.status(404).json({ error: 'GRN not found' });
    await grn.update({
      approval_status: status || 'Approved',
      approved_by: approved_by || req.session?.user?.name || 'System',
      approved_date: new Date(),
      approval_remarks: remarks || grn.approval_remarks,
    });
    res.json(grn);
  } catch (err) {
    console.error('Error approving GRN:', err);
    res.status(500).json({ error: 'Failed to approve GRN' });
  }
};

exports.deleteGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const grn = await GRN.findByPk(id);
    if (!grn) return res.status(404).json({ error: 'GRN not found' });
    await GRNItem.destroy({ where: { grn_id: id } });
    await grn.destroy();
    res.json({ message: 'GRN deleted' });
  } catch (err) {
    console.error('Error deleting GRN:', err);
    res.status(500).json({ error: 'Failed to delete GRN' });
  }
};
