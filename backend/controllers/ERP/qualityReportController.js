const db = require('../../models/ERP');
const { Op, fn, col } = require('sequelize');
const { QualityInspection, NonConformance } = db;

exports.rejectionAnalysis = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from && to) where.inspection_date = { [Op.between]: [from, to] };

    const byType = await QualityInspection.findAll({
      where,
      attributes: ['inspection_type', [fn('COUNT', col('id')), 'count'], [fn('SUM', col('rejected_qty')), 'total_rejected']],
      group: ['inspection_type'], raw: true,
    });
    const totalPassed = await QualityInspection.sum('accepted_qty', { where: { ...where } }) || 0;
    const totalRejected = await QualityInspection.sum('rejected_qty', { where: { ...where } }) || 0;

    res.json({ by_type: byType, total_accepted: totalPassed, total_rejected: totalRejected });
  } catch (err) { console.error('qual.rejection', err); res.status(500).json({ error: 'Failed' }); }
};

exports.ncSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from && to) where.createdAt = { [Op.between]: [new Date(from), new Date(to + 'T23:59:59')] };

    const byStatus = await NonConformance.findAll({
      where,
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'], raw: true,
    });
    const byType = await NonConformance.findAll({
      where,
      attributes: ['nc_type', [fn('COUNT', col('id')), 'count']],
      group: ['nc_type'], raw: true,
    });
    res.json({ by_status: byStatus, by_type: byType });
  } catch (err) { console.error('qual.ncSummary', err); res.status(500).json({ error: 'Failed' }); }
};

exports.inspectionSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = {};
    if (from && to) where.inspection_date = { [Op.between]: [from, to] };
    const data = await QualityInspection.findAll({
      where,
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'], raw: true,
    });
    res.json(data);
  } catch (err) { console.error('qual.summary', err); res.status(500).json({ error: 'Failed' }); }
};
