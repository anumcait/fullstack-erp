const { Op, fn, col, literal } = require('sequelize');
const db = require('../../models/ERP');

const ItemMaster = db.ItemMaster;
const Unit = db.Unit;

exports.getStockLedger = async (req, res) => {
  try {
    const { item_id, from_date, to_date } = req.query;
    const transactions = [];

    if (item_id) {
      const grnItems = await db.GRNItem.findAll({
        where: { item_id },
        include: [{ model: db.GRN, as: 'grn', attributes: ['grn_no', 'grn_date'] }],
        attributes: ['id', 'item_code', 'item_name', 'accepted_qty'],
      });
      for (const g of grnItems) {
        transactions.push({
          date: g.grn?.grn_date || null,
          ref_type: 'GRN',
          ref_no: g.grn?.grn_no || '-',
          item_code: g.item_code,
          item_name: g.item_name,
          inward_qty: parseFloat(g.accepted_qty) || 0,
          outward_qty: 0,
          created_date: g.grn?.grn_date || null,
        });
      }

      const issueItems = await db.MaterialIssueItem.findAll({
        where: { item_id },
        include: [{ model: db.MaterialIssue, as: 'issue', attributes: ['issue_no', 'issue_date'] }],
        attributes: ['id', 'item_code', 'item_name', 'quantity'],
      });
      for (const i of issueItems) {
        transactions.push({
          date: i.issue?.issue_date || null,
          ref_type: 'Material Issue',
          ref_no: i.issue?.issue_no || '-',
          item_code: i.item_code,
          item_name: i.item_name,
          inward_qty: 0,
          outward_qty: parseFloat(i.quantity) || 0,
          created_date: i.issue?.issue_date || null,
        });
      }

      const returnItems = await db.MaterialReturnItem.findAll({
        where: { item_id },
        include: [{ model: db.MaterialReturn, as: 'returnRef', attributes: ['return_no', 'return_date', 'return_type'] }],
        attributes: ['id', 'item_code', 'item_name', 'quantity'],
      });
      for (const r of returnItems) {
        const isInward = r.returnRef?.return_type === 'To Store';
        transactions.push({
          date: r.returnRef?.return_date || null,
          ref_type: 'Material Return',
          ref_no: r.returnRef?.return_no || '-',
          item_code: r.item_code,
          item_name: r.item_name,
          inward_qty: isInward ? (parseFloat(r.quantity) || 0) : 0,
          outward_qty: !isInward ? (parseFloat(r.quantity) || 0) : 0,
          created_date: r.returnRef?.return_date || null,
        });
      }
    }

    transactions.sort((a, b) => (a.date || '').localeCompare(b.date || '') || 0);

    let running = 0;
    const ledger = transactions.map((t) => {
      running += t.inward_qty - t.outward_qty;
      return { ...t, balance_qty: running };
    });

    const items = await ItemMaster.findAll({
      attributes: ['id', 'item_code', 'item_name'],
      include: [{ model: Unit, as: 'unit', attributes: ['name', 'short_name'] }],
      order: [['item_code', 'ASC']],
    });

    res.json({ ledger, items });
  } catch (err) {
    console.error('Error fetching stock ledger:', err);
    res.status(500).json({ error: 'Failed to fetch stock ledger' });
  }
};
