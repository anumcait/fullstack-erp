const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { generateDocNumber } = require('../../utils/docNumber');

const RFQ = db.RFQ;
const RFQItem = db.RFQItem;
const RFQVendor = db.RFQVendor;
const SupplierMaster = db.SupplierMaster;
const PurchaseSettings = db.PurchaseSettings;

exports.getRFQs = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { rfq_no: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const rfqs = await RFQ.findAll({
      where,
      include: [
        { model: RFQItem, as: 'items' },
        {
          model: RFQVendor, as: 'vendors',
          include: [{ model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] }],
        },
      ],
      order: [['created_date', 'DESC']],
    });
    res.json(rfqs);
  } catch (err) {
    console.error('Error fetching RFQs:', err);
    res.status(500).json({ error: 'Failed to fetch RFQs' });
  }
};

exports.getRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findByPk(req.params.id, {
      include: [
        { model: RFQItem, as: 'items' },
        {
          model: RFQVendor, as: 'vendors',
          include: [{ model: SupplierMaster, as: 'supplier' }],
        },
      ],
    });
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    res.json(rfq);
  } catch (err) {
    console.error('Error fetching RFQ:', err);
    res.status(500).json({ error: 'Failed to fetch RFQ' });
  }
};

exports.createRFQ = async (req, res) => {
  try {
    let { items, vendors, ...header } = req.body;

    if (!header.rfq_no) {
      const settings = await PurchaseSettings.findByPk(1);
      if (settings?.auto_generate_rfq) {
        header.rfq_no = await generateDocNumber('RFQ', 'rfq_prefix', 'rfq_no', settings);
      } else {
        return res.status(400).json({ error: 'RFQ number is required. Enable auto-generation in Settings.' });
      }
    }

    const existing = await RFQ.findOne({ where: { rfq_no: header.rfq_no } });
    if (existing) return res.status(409).json({ error: `RFQ '${header.rfq_no}' already exists` });

    const rfq = await RFQ.create(header);
    if (items && items.length > 0) {
      const itemRows = items.map((it) => ({ ...it, rfq_id: rfq.id }));
      await RFQItem.bulkCreate(itemRows);
    }
    if (vendors && vendors.length > 0) {
      const vendorRows = vendors.map((v) => ({ ...v, rfq_id: rfq.id }));
      await RFQVendor.bulkCreate(vendorRows);
    }

    const result = await RFQ.findByPk(rfq.id, {
      include: [
        { model: RFQItem, as: 'items' },
        { model: RFQVendor, as: 'vendors', include: [{ model: SupplierMaster, as: 'supplier' }] },
      ],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating RFQ:', err);
    res.status(500).json({ error: 'Failed to create RFQ' });
  }
};

exports.updateRFQ = async (req, res) => {
  try {
    const { id } = req.params;
    const rfq = await RFQ.findByPk(id);
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });

    const { items, vendors, ...header } = req.body;
    await rfq.update(header);

    if (items) {
      await RFQItem.destroy({ where: { rfq_id: id } });
      const itemRows = items.map((it) => ({ ...it, rfq_id: id }));
      await RFQItem.bulkCreate(itemRows);
    }
    if (vendors) {
      await RFQVendor.destroy({ where: { rfq_id: id } });
      const vendorRows = vendors.map((v) => ({ ...v, rfq_id: id }));
      await RFQVendor.bulkCreate(vendorRows);
    }

    const result = await RFQ.findByPk(id, {
      include: [
        { model: RFQItem, as: 'items' },
        { model: RFQVendor, as: 'vendors', include: [{ model: SupplierMaster, as: 'supplier' }] },
      ],
    });
    res.json(result);
  } catch (err) {
    console.error('Error updating RFQ:', err);
    res.status(500).json({ error: 'Failed to update RFQ' });
  }
};

exports.deleteRFQ = async (req, res) => {
  try {
    const { id } = req.params;
    const rfq = await RFQ.findByPk(id);
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    await RFQItem.destroy({ where: { rfq_id: id } });
    await RFQVendor.destroy({ where: { rfq_id: id } });
    await rfq.destroy();
    res.json({ message: 'RFQ deleted' });
  } catch (err) {
    console.error('Error deleting RFQ:', err);
    res.status(500).json({ error: 'Failed to delete RFQ' });
  }
};

exports.selectVendorQuote = async (req, res) => {
  try {
    const { id, vendorId } = req.params;
    const rfq = await RFQ.findByPk(id);
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });

    await RFQVendor.update({ is_selected: false }, { where: { rfq_id: id } });
    await RFQVendor.update({ is_selected: true }, { where: { id: vendorId, rfq_id: id } });

    res.json({ message: 'Vendor quote selected' });
  } catch (err) {
    console.error('Error selecting vendor quote:', err);
    res.status(500).json({ error: 'Failed to select vendor quote' });
  }
};
