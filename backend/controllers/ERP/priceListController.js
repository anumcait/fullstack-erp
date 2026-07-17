const db = require('../../models/ERP');
const { Op } = require('sequelize');

const VendorPriceList = db.VendorPriceList;
const SupplierMaster = db.SupplierMaster;
const ItemMaster = db.ItemMaster;

exports.getPriceList = async (req, res) => {
  try {
    const { search, supplier_id, item_id, is_active } = req.query;
    const where = {};
    if (supplier_id) where.supplier_id = supplier_id;
    if (item_id) where.item_id = item_id;
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const prices = await VendorPriceList.findAll({
      where,
      include: [
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
        { model: ItemMaster, as: 'item', attributes: ['id', 'item_code', 'item_name'] },
      ],
      order: [['created_date', 'DESC']],
    });
    res.json(prices);
  } catch (err) {
    console.error('Error fetching price list:', err);
    res.status(500).json({ error: 'Failed to fetch price list' });
  }
};

exports.createPrice = async (req, res) => {
  try {
    const { supplier_id, item_id, rate } = req.body;
    if (!supplier_id || !item_id || rate === undefined) {
      return res.status(400).json({ error: 'Supplier, item, and rate are required' });
    }
    const price = await VendorPriceList.create(req.body);
    const result = await VendorPriceList.findByPk(price.id, {
      include: [
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
        { model: ItemMaster, as: 'item', attributes: ['id', 'item_code', 'item_name'] },
      ],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating price:', err);
    res.status(500).json({ error: 'Failed to create price entry' });
  }
};

exports.updatePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const price = await VendorPriceList.findByPk(id);
    if (!price) return res.status(404).json({ error: 'Price entry not found' });

    await price.update(req.body);
    const result = await VendorPriceList.findByPk(id, {
      include: [
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
        { model: ItemMaster, as: 'item', attributes: ['id', 'item_code', 'item_name'] },
      ],
    });
    res.json(result);
  } catch (err) {
    console.error('Error updating price:', err);
    res.status(500).json({ error: 'Failed to update price entry' });
  }
};

exports.deletePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const price = await VendorPriceList.findByPk(id);
    if (!price) return res.status(404).json({ error: 'Price entry not found' });
    await price.update({ is_active: false });
    res.json({ message: 'Price entry deactivated' });
  } catch (err) {
    console.error('Error deleting price:', err);
    res.status(500).json({ error: 'Failed to delete price entry' });
  }
};
