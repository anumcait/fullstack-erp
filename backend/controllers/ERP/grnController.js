const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { generateDocNumber } = require('../../utils/docNumber');

const GRN = db.GRN;
const GRNItem = db.GRNItem;
const PurchaseOrder = db.PurchaseOrder;
const PurchaseOrderItem = db.PurchaseOrderItem;
const SupplierMaster = db.SupplierMaster;
const PurchaseSettings = db.PurchaseSettings;

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
      order: [['created_at', 'DESC']],
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
    res.json(result);
  } catch (err) {
    console.error('Error updating GRN:', err);
    res.status(500).json({ error: 'Failed to update GRN' });
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
