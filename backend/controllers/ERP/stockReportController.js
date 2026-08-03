const { Op } = require('sequelize');
const db = require('../../models/ERP');

// Aggregate stock movements for a set of items from a given date onward,
// split into "on the date" vs "after the date".
async function bucketMovements(ItemModel, headerModel, headerAlias, dateField, qtyField, statusValue, itemIds, date) {
  const rows = await ItemModel.findAll({
    where: { item_id: { [Op.in]: itemIds } },
    attributes: ['item_id', qtyField],
    include: [
      {
        model: headerModel,
        as: headerAlias,
        where: { [dateField]: { [Op.gte]: date }, status: statusValue },
        attributes: [dateField],
      },
    ],
  });

  const onDate = {};
  const after = {};
  for (const r of rows) {
    const d = r[headerAlias] ? r[headerAlias][dateField] : null;
    const qty = parseFloat(r[qtyField]) || 0;
    if (!d) continue;
    if (d === date) onDate[r.item_id] = (onDate[r.item_id] || 0) + qty;
    else after[r.item_id] = (after[r.item_id] || 0) + qty;
  }
  return { onDate, after };
}

exports.getDayWiseStock = async (req, res) => {
  try {
    let date = req.query.date;
    if (!date) {
      date = new Date().toISOString().slice(0, 10);
    }

    const items = await db.ItemMaster.findAll({
      where: { is_active: true },
      attributes: ['id', 'item_code', 'item_name', 'current_stock', 'group_id', 'unit_id'],
      include: [
        { model: db.ItemGroup, as: 'group', attributes: ['id', 'name'] },
        { model: db.Unit, as: 'unit', attributes: ['id', 'name', 'short_name'] },
      ],
      order: [['item_name', 'ASC']],
    });

    if (items.length === 0) {
      return res.json({ date, groups: [], totals: { opening: 0, consume: 0, received: 0, rejection: 0, balance: 0 } });
    }

    const itemIds = items.map((i) => i.id);

    const [received, consumed, rejected] = await Promise.all([
      bucketMovements(db.GRNItem, db.GRN, 'grn', 'ir_date', 'accepted_qty', 'Received', itemIds, date),
      bucketMovements(db.MaterialIssueItem, db.MaterialIssue, 'issue', 'issue_date', 'quantity', 'Issued', itemIds, date),
      bucketMovements(db.MaterialReturnItem, db.MaterialReturn, 'returnRef', 'return_date', 'quantity', 'Returned', itemIds, date),
    ]);

    const groupsMap = {};
    const totals = { opening: 0, consume: 0, received: 0, rejection: 0, balance: 0 };

    items.forEach((item) => {
      const current = parseFloat(item.current_stock) || 0;
      const recToday = received.onDate[item.id] || 0;
      const recAfter = received.after[item.id] || 0;
      const conToday = consumed.onDate[item.id] || 0;
      const conAfter = consumed.after[item.id] || 0;
      const rejToday = rejected.onDate[item.id] || 0;
      const rejAfter = rejected.after[item.id] || 0;

      const opening = current - (recToday + recAfter) + (conToday + conAfter) + (rejToday + rejAfter);
      const balance = opening + recToday - conToday - rejToday;

      const groupName = item.group ? item.group.name : 'Uncategorized';
      if (!groupsMap[groupName]) groupsMap[groupName] = [];
      groupsMap[groupName].push({
        item_id: item.id,
        item_code: item.item_code,
        item_name: item.item_name,
        unit: item.unit ? (item.unit.short_name || item.unit.name) : '',
        opening: Number(opening.toFixed(2)),
        consume: Number(conToday.toFixed(2)),
        received: Number(recToday.toFixed(2)),
        rejection: Number(rejToday.toFixed(2)),
        balance: Number(balance.toFixed(2)),
      });

      totals.opening += opening;
      totals.consume += conToday;
      totals.received += recToday;
      totals.rejection += rejToday;
      totals.balance += balance;
    });

    const groups = Object.keys(groupsMap)
      .sort()
      .map((group) => ({
        group,
        items: groupsMap[group].map((it, idx) => ({ sno: idx + 1, ...it })),
      }));

    Object.keys(totals).forEach((k) => { totals[k] = Number(totals[k].toFixed(2)); });

    res.json({ date, groups, totals });
  } catch (err) {
    console.error('Error fetching day-wise stock:', err);
    res.status(500).json({ error: 'Failed to fetch day-wise stock' });
  }
};
