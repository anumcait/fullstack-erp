const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { generateDocNumber } = require('../../utils/docNumber');

const PurchaseOrder = db.PurchaseOrder;
const PurchaseOrderItem = db.PurchaseOrderItem;
const SupplierMaster = db.SupplierMaster;
const PurchaseSettings = db.PurchaseSettings;

exports.getPurchaseOrders = async (req, res) => {
  try {
    const { search, status, supplier_id } = req.query;
    const where = {};
    if (status) where.status = status;
    if (supplier_id) where.supplier_id = supplier_id;
    if (search) {
      where[Op.or] = [
        { po_no: { [Op.iLike]: `%${search}%` } },
        { '$supplier.supplier_name$': { [Op.iLike]: `%${search}%` } },
      ];
    }
    const orders = await PurchaseOrder.findAll({
      where,
      include: [
        { model: PurchaseOrderItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching POs:', err);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
};

exports.getPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByPk(req.params.id, {
      include: [
        { model: PurchaseOrderItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier' },
      ],
    });
    if (!order) return res.status(404).json({ error: 'Purchase order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error fetching PO:', err);
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    let { items, ...header } = req.body;

    // Auto-generate PO number if not provided or auto-generation is enabled
    if (!header.po_no) {
      const settings = await PurchaseSettings.findByPk(1);
      if (settings?.auto_generate_po) {
        header.po_no = await generateDocNumber('PurchaseOrder', 'po_prefix', 'po_no', settings);
      } else {
        return res.status(400).json({ error: 'PO number is required. Enable auto-generation in Settings.' });
      }
    }

    if (!header.supplier_id) return res.status(400).json({ error: 'Supplier is required' });

    const existing = await PurchaseOrder.findOne({ where: { po_no: header.po_no } });
    if (existing) return res.status(409).json({ error: `PO '${header.po_no}' already exists` });

    const order = await PurchaseOrder.create(header);
    if (items && items.length > 0) {
      const itemRows = items.map((it) => ({ ...it, po_id: order.id }));
      await PurchaseOrderItem.bulkCreate(itemRows);
    }
    const result = await PurchaseOrder.findByPk(order.id, {
      include: [
        { model: PurchaseOrderItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier' },
      ],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating PO:', err);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PurchaseOrder.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Purchase order not found' });

    const { items, ...header } = req.body;
    if (order.status !== 'Draft' && header.status === 'Draft') {
      // allow status change only if not already processed
    }
    await order.update(header);

    if (items) {
      await PurchaseOrderItem.destroy({ where: { po_id: id } });
      const itemRows = items.map((it) => ({ ...it, po_id: id }));
      await PurchaseOrderItem.bulkCreate(itemRows);
    }

    const result = await PurchaseOrder.findByPk(id, {
      include: [
        { model: PurchaseOrderItem, as: 'items' },
        { model: SupplierMaster, as: 'supplier' },
      ],
    });
    res.json(result);
  } catch (err) {
    console.error('Error updating PO:', err);
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
};

exports.approvePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approved_by, notes } = req.body;
    const order = await PurchaseOrder.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Purchase order not found' });

    await order.update({
      status: status || 'Approved',
      approved_by: approved_by || 'System',
      approved_date: new Date(),
      notes: notes || order.notes,
    });
    res.json(order);
  } catch (err) {
    console.error('Error approving PO:', err);
    res.status(500).json({ error: 'Failed to approve purchase order' });
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await PurchaseOrder.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Purchase order not found' });
    if (order.status !== 'Draft') {
      return res.status(400).json({ error: 'Only draft POs can be deleted' });
    }
    await PurchaseOrderItem.destroy({ where: { po_id: id } });
    await order.destroy();
    res.json({ message: 'Purchase order deleted' });
  } catch (err) {
    console.error('Error deleting PO:', err);
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
};
