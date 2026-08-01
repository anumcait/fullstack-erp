const db = require('../../models/ERP');
const { Op } = require('sequelize');

const Warehouse = db.Warehouse;

exports.getList = async (req, res) => {
  try {
    const { search, active } = req.query;
    const where = {};
    if (active === 'true') where.is_active = true;
    if (search) {
      where[Op.or] = [
        { warehouse_code: { [Op.iLike]: `%${search}%` } },
        { warehouse_name: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const rows = await Warehouse.findAll({ where, order: [['warehouse_code', 'ASC']] });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching warehouses:', err);
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const row = await Warehouse.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Warehouse not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch warehouse' });
  }
};

exports.create = async (req, res) => {
  try {
    const { warehouse_code, warehouse_name, location, is_active } = req.body;
    if (!warehouse_code || !warehouse_name) {
      return res.status(400).json({ error: 'Warehouse code and name are required' });
    }
    if (await Warehouse.findOne({ where: { warehouse_code } })) {
      return res.status(409).json({ error: `Warehouse code '${warehouse_code}' already exists` });
    }
    const row = await Warehouse.create({
      warehouse_code,
      warehouse_name,
      location: location || null,
      is_active: is_active !== false,
    });
    res.status(201).json(row);
  } catch (err) {
    console.error('Error creating warehouse:', err);
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
};

exports.update = async (req, res) => {
  try {
    const row = await Warehouse.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Warehouse not found' });
    const { warehouse_code, warehouse_name, location, is_active } = req.body;
    if (warehouse_code && warehouse_code !== row.warehouse_code) {
      if (await Warehouse.findOne({ where: { warehouse_code } })) {
        return res.status(409).json({ error: `Warehouse code '${warehouse_code}' already exists` });
      }
    }
    await row.update({
      warehouse_code: warehouse_code || row.warehouse_code,
      warehouse_name: warehouse_name || row.warehouse_name,
      location: location !== undefined ? location : row.location,
      is_active: is_active !== undefined ? is_active : row.is_active,
    });
    res.json(row);
  } catch (err) {
    console.error('Error updating warehouse:', err);
    res.status(500).json({ error: 'Failed to update warehouse' });
  }
};

exports.remove = async (req, res) => {
  try {
    const row = await Warehouse.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Warehouse not found' });
    await row.update({ is_active: false });
    res.json({ message: 'Warehouse deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to deactivate warehouse' });
  }
};

// ── Warehouse-wise stock ──────────────────────────────────────────────
exports.warehouseWiseStock = async (req, res) => {
  try {
    const { as_of } = req.query;
    const endDate = as_of ? `${as_of} 23:59:59` : new Date().toISOString().slice(0, 10) + ' 23:59:59';
    const rows = await db.sequelize.query(
      `SELECT w.id AS warehouse_id, w.warehouse_code, w.warehouse_name,
              COALESCE(SUM(l.qty_in), 0) AS qty_in,
              COALESCE(SUM(l.qty_out), 0) AS qty_out,
              COALESCE(SUM(l.qty_in) - SUM(l.qty_out), 0) AS on_hand_qty,
              COALESCE(SUM(l.stock_value), 0) AS stock_value,
              COUNT(DISTINCT l.item_id) AS item_count
       FROM m_warehouse w
       LEFT JOIN t_stock_ledger l ON l.warehouse_id = w.id
         AND l.reversal_of IS NULL AND l.ledger_date <= :endDate::timestamp
       WHERE w.is_active = true
       GROUP BY w.id, w.warehouse_code, w.warehouse_name
       ORDER BY w.warehouse_code`,
      { replacements: { endDate }, type: db.Sequelize.QueryTypes.SELECT }
    );
    const total = rows.reduce(
      (t, r) => {
        t.on_hand_qty += Number(r.on_hand_qty || 0);
        t.stock_value += Number(r.stock_value || 0);
        return t;
      },
      { on_hand_qty: 0, stock_value: 0 }
    );
    res.json({ rows, total });
  } catch (err) {
    console.error('Error warehouse-wise stock:', err);
    res.status(500).json({ error: 'Failed to fetch warehouse-wise stock' });
  }
};
