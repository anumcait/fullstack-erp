const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { generateDocNumber } = require('../../utils/docNumber');

const GRN = db.GRN;
const GRNItem = db.GRNItem;
const PurchaseOrder = db.PurchaseOrder;
const PurchaseOrderItem = db.PurchaseOrderItem;
const PurchaseRequisition = db.PurchaseRequisition;
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
    const { search, status, po_id, supplier_id, date_from, date_to, year } = req.query;
    const where = {};
    if (status) where.status = status;
    if (po_id) where.po_id = po_id;
    if (supplier_id) where.supplier_id = supplier_id;
    if (date_from || date_to || year) {
      const dateWhere = {};
      if (date_from) dateWhere[Op.gte] = date_from;
      if (date_to) dateWhere[Op.lte] = date_to;
      if (year) {
        dateWhere[Op.gte] = `${year}-01-01`;
        dateWhere[Op.lte] = `${year}-12-31`;
      }
      where.grn_date = dateWhere;
    }
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
        { model: PurchaseRequisition, as: 'purchaseRequisition', attributes: ['id', 'req_no', 'req_date'] },
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
        { model: PurchaseRequisition, as: 'purchaseRequisition' },
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

    const existing = await GRN.findOne({ where: { grn_no: header.grn_no } });
    if (existing) return res.status(409).json({ error: `GRN '${header.grn_no}' already exists` });

    // Default to Draft unless explicitly submitted
    if (!header.status || header.status === 'Received') {
      header.status = 'Draft';
    }

    const grn = await GRN.create(header);
    if (items && items.length > 0) {
      const itemRows = items.map((it) => ({ ...it, grn_id: grn.id }));
      await GRNItem.bulkCreate(itemRows);

      // Update PO item received quantities only when status is Received
      if (header.status !== 'Draft') {
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
    }

    const result = await GRN.findByPk(grn.id, {
      include: [
        { model: GRNItem, as: 'items' },
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'po_no'] },
        { model: PurchaseRequisition, as: 'purchaseRequisition', attributes: ['id', 'req_no'] },
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
      ],
    });
    // Only post cost when status is not Draft
    if (header.status !== 'Draft') await postGRNCost(grn.id);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating GRN:', err);
    res.status(500).json({ error: 'Failed to create GRN' });
  }
};

exports.updateGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const grn = await GRN.findByPk(id, {
      include: [{ model: GRNItem, as: 'items' }],
    });
    if (!grn) return res.status(404).json({ error: 'GRN not found' });
    if (grn.status !== 'Draft') return res.status(400).json({ error: 'Only draft GRNs can be edited' });

    const { items, ...header } = req.body;
    const wasDraft = grn.status === 'Draft';
    const becomingReceived = header.status === 'Received';

    await grn.update(header);

    if (items) {
      // Reverse old PO item received quantities
      if (grn.items) {
        for (const oldIt of grn.items) {
          if (oldIt.po_item_id) {
            const poItem = await PurchaseOrderItem.findByPk(oldIt.po_item_id);
            if (poItem) {
              const newReceived = Math.max(0, parseFloat(poItem.received_quantity || 0) - parseFloat(oldIt.accepted_qty || 0));
              await poItem.update({ received_quantity: newReceived });
            }
          }
        }
      }

      await GRNItem.destroy({ where: { grn_id: id } });
      const itemRows = items.map((it) => ({ ...it, grn_id: id }));
      await GRNItem.bulkCreate(itemRows);

      // Apply new PO item received quantities (only when becoming Received)
      if (becomingReceived) {
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
    }

    const result = await GRN.findByPk(id, {
      include: [
        { model: GRNItem, as: 'items' },
        { model: PurchaseOrder, as: 'purchaseOrder' },
        { model: PurchaseRequisition, as: 'purchaseRequisition' },
        { model: SupplierMaster, as: 'supplier' },
      ],
    });
    // Post cost when becoming Received and not already posted
    if (becomingReceived && !grn.cost_posted) {
      await postGRNCost(id);
    }
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
    const isApproved = (status || 'Approved') === 'Approved';
    await grn.update({
      approval_status: status || 'Approved',
      approved_by: approved_by || req.session?.user?.name || 'System',
      approved_date: new Date(),
      approval_remarks: remarks || grn.approval_remarks,
    });
    // Post cost on approval if not already posted
    if (isApproved && !grn.cost_posted) {
      await postGRNCost(id);
    }
    res.json(grn);
  } catch (err) {
    console.error('Error approving GRN:', err);
    res.status(500).json({ error: 'Failed to approve GRN' });
  }
};

exports.deleteGRN = async (req, res) => {
  try {
    const { id } = req.params;
    const grn = await GRN.findByPk(id, {
      include: [{ model: GRNItem, as: 'items' }],
    });
    if (!grn) return res.status(404).json({ error: 'GRN not found' });

    // Reverse PO item received quantities if status was Received
    if (grn.status === 'Received' && grn.items) {
      for (const it of grn.items) {
        if (it.po_item_id) {
          const poItem = await PurchaseOrderItem.findByPk(it.po_item_id);
          if (poItem) {
            const newReceived = Math.max(0, parseFloat(poItem.received_quantity || 0) - parseFloat(it.accepted_qty || 0));
            await poItem.update({ received_quantity: newReceived });
          }
        }
      }
    }

    await GRNItem.destroy({ where: { grn_id: id } });
    await grn.destroy();
    res.json({ message: 'GRN deleted' });
  } catch (err) {
    console.error('Error deleting GRN:', err);
    res.status(500).json({ error: 'Failed to delete GRN' });
  }
};
