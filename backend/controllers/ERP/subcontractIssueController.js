const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { SubcontractIssue, SubcontractIssueItem, SubcontractOrder } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { issue_no: { [Op.iLike]: `%${req.query.search}%` } },
        { vendor_name: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status) where.status = req.query.status;
    if (req.query.vendor) where.vendor_name = { [Op.iLike]: `%${req.query.vendor}%` };
    const rows = await SubcontractIssue.findAll({
      where,
      include: [
        { model: SubcontractIssueItem, as: 'items' },
        { model: SubcontractOrder, as: 'order', attributes: ['order_no'] },
      ],
      order: [['created_date', 'DESC']],
    });
    res.json(rows);
  } catch (err) { console.error('subIssue.list', err); res.status(500).json({ error: 'Failed' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await SubcontractIssue.findByPk(req.params.id, {
      include: [
        { model: SubcontractIssueItem, as: 'items' },
        { model: SubcontractOrder, as: 'order', attributes: ['order_no'] },
      ],
    });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('subIssue.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.create = async (req, res) => {
  try {
    const count = await SubcontractIssue.count();
    const year = new Date().getFullYear();
    const issueNo = req.body.issue_no || `SUB-ISS-${year}-${String(count + 1).padStart(4, '0')}`;
    const { items, ...header } = req.body;
    const doc = await SubcontractIssue.create({ ...header, issue_no: issueNo });
    if (items && items.length > 0) {
      const issueItems = items.map((it) => ({ ...it, issue_id: doc.id }));
      await SubcontractIssueItem.bulkCreate(issueItems);
    }
    const result = await SubcontractIssue.findByPk(doc.id, {
      include: [{ model: SubcontractIssueItem, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) { console.error('subIssue.create', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const doc = await SubcontractIssue.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const { items, ...header } = req.body;
    await doc.update(header);
    if (items) {
      await SubcontractIssueItem.destroy({ where: { issue_id: doc.id } });
      const issueItems = items.map((it) => ({ ...it, issue_id: doc.id }));
      await SubcontractIssueItem.bulkCreate(issueItems);
    }
    const result = await SubcontractIssue.findByPk(doc.id, {
      include: [{ model: SubcontractIssueItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) { console.error('subIssue.update', err); res.status(500).json({ error: 'Failed' }); }
};

exports.remove = async (req, res) => {
  try {
    await SubcontractIssueItem.destroy({ where: { issue_id: req.params.id } });
    await SubcontractIssue.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('subIssue.remove', err); res.status(500).json({ error: 'Failed' }); }
};
