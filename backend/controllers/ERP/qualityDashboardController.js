const db = require('../../models/ERP');
const { Op, fn, col } = require('sequelize');
const { QualityInspection, NonConformance } = db;

exports.stats = async (req, res) => {
  try {
    const [totalInspections, passed, rejected, partial, pending, inProgress, totalNCs, openNCs] = await Promise.all([
      QualityInspection.count(),
      QualityInspection.count({ where: { status: 'Passed' } }),
      QualityInspection.count({ where: { status: 'Rejected' } }),
      QualityInspection.count({ where: { status: 'Partial' } }),
      QualityInspection.count({ where: { status: 'Pending' } }),
      QualityInspection.count({ where: { status: 'In Progress' } }),
      NonConformance.count(),
      NonConformance.count({ where: { status: { [Op.in]: ['Open', 'In Progress'] } } }),
    ]);

    const typeBreakdown = await QualityInspection.findAll({
      attributes: ['inspection_type', [fn('COUNT', col('id')), 'count']],
      group: ['inspection_type'], raw: true,
    });

    const recentInspections = await QualityInspection.findAll({
      order: [['createdAt', 'DESC']], limit: 10,
    });

    const passRate = totalInspections > 0 ? ((passed / totalInspections) * 100).toFixed(1) : 0;

    res.json({
      total_inspections: totalInspections,
      passed, rejected, partial, pending, in_progress: inProgress,
      pass_rate: parseFloat(passRate),
      total_nc: totalNCs,
      open_nc: openNCs,
      type_breakdown: typeBreakdown,
      recent_inspections: recentInspections,
    });
  } catch (err) { console.error('qual.dashboard', err); res.status(500).json({ error: 'Failed to fetch dashboard stats' }); }
};
