const db = require('../../models/ERP');
const { Op } = require('sequelize');

const ItemMaster = db.ItemMaster;
const ItemGroup = db.ItemGroup;
const MaterialRequisition = db.MaterialRequisition;
const MaterialRequisitionItem = db.MaterialRequisitionItem;
const MaterialIssue = db.MaterialIssue;
const GRN = db.GRN;

exports.getStock = async (req, res) => {
  try {
    const items = await ItemMaster.findAll({
      attributes: ['id', 'item_code', 'item_name', 'current_stock', 'min_stock', 'max_stock', 'reorder_level', 'unit_id'],
    });
    res.json(items);
  } catch (err) {
    console.error('Error fetching stock:', err);
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
};

exports.checkStockForMR = async (req, res) => {
  try {
    const doc = await MaterialRequisition.findByPk(req.params.id, {
      include: [{ model: MaterialRequisitionItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'MR not found' });

    const itemIds = doc.items.map((it) => it.item_id).filter(Boolean);
    const stockMap = {};
    if (itemIds.length > 0) {
      const items = await ItemMaster.findAll({ where: { id: itemIds } });
      items.forEach((it) => { stockMap[it.id] = it.current_stock; });
    }

    const results = doc.items.map((it) => {
      const available = Number(stockMap[it.item_id] || 0);
      const requested = Number(it.quantity || 0);
      const shortfall = Math.max(0, requested - available);
      return {
        item_id: it.item_id,
        item_code: it.item_code,
        item_name: it.item_name,
        requested,
        available,
        shortfall,
        sufficient: shortfall === 0,
      };
    });

    const allSufficient = results.every((r) => r.sufficient);
    res.json({ mr_id: doc.id, mr_no: doc.req_no, items: results, allSufficient });
  } catch (err) {
    console.error('Error checking stock for MR:', err);
    res.status(500).json({ error: 'Failed to check stock' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalItems,
      lowStockItems,
      totalCategories,
      pendingMRs,
      pendingIssues,
      recentGRNs,
      stockValue,
    ] = await Promise.all([
      ItemMaster.count({ where: { is_active: true } }),
      ItemMaster.count({ where: { current_stock: { [Op.lte]: { [Op.col]: 'reorder_level' } }, is_active: true } }),
      ItemGroup.count({ where: { is_active: true } }),
      MaterialRequisition.count({ where: { status: { [Op.in]: ['Pending', 'Approved'] } } }),
      MaterialIssue.count({ where: { status: { [Op.in]: ['Pending', 'Approved'] } } }).catch(() => 0),
      GRN.count({ where: { created_date: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }).catch(() => 0),
      db.sequelize.query(
        `SELECT COALESCE(SUM(current_stock * COALESCE(NULLIF(moving_average_cost,0), standard_cost, 0)),0) AS v FROM m_item_master WHERE is_active = true AND current_stock > 0`,
        { type: db.Sequelize.QueryTypes.SELECT }
      ).then((r) => r[0]?.v || 0),
    ]);

    res.json({
      total_items: totalItems,
      low_stock: lowStockItems,
      total_categories: totalCategories,
      pending_mrs: pendingMRs,
      pending_issues: pendingIssues,
      recent_grns: recentGRNs,
      total_stock_value: Number(stockValue || 0).toFixed(2),
    });
  } catch (err) {
    console.error('Error fetching stores dashboard:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
