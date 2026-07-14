const db = require('../../models/ERP');
const { Op } = require('sequelize');

const VendorRating = db.VendorRating;
const SupplierMaster = db.SupplierMaster;

exports.getRatings = async (req, res) => {
  try {
    const { supplier_id } = req.query;
    const where = {};
    if (supplier_id) where.supplier_id = supplier_id;

    const ratings = await VendorRating.findAll({
      where,
      include: [
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
      ],
      order: [['rating_date', 'DESC']],
    });
    res.json(ratings);
  } catch (err) {
    console.error('Error fetching ratings:', err);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
};

exports.createRating = async (req, res) => {
  try {
    const { supplier_id, quality_score, delivery_score, price_score, service_score } = req.body;
    if (!supplier_id) return res.status(400).json({ error: 'Supplier is required' });

    const overall = (
      (parseFloat(quality_score) || 0) +
      (parseFloat(delivery_score) || 0) +
      (parseFloat(price_score) || 0) +
      (parseFloat(service_score) || 0)
    ) / 4;

    const rating = await VendorRating.create({
      ...req.body,
      overall_score: Math.round(overall * 100) / 100,
      rated_by: req.session?.user?.name || 'System',
    });

    const result = await VendorRating.findByPk(rating.id, {
      include: [
        { model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_code', 'supplier_name'] },
      ],
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating rating:', err);
    res.status(500).json({ error: 'Failed to create rating' });
  }
};

exports.deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const rating = await VendorRating.findByPk(id);
    if (!rating) return res.status(404).json({ error: 'Rating not found' });
    await rating.destroy();
    res.json({ message: 'Rating deleted' });
  } catch (err) {
    console.error('Error deleting rating:', err);
    res.status(500).json({ error: 'Failed to delete rating' });
  }
};

exports.getSupplierSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const ratings = await VendorRating.findAll({
      where: { supplier_id: id },
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.col('quality_score')), 'avg_quality'],
        [db.sequelize.fn('AVG', db.sequelize.col('delivery_score')), 'avg_delivery'],
        [db.sequelize.fn('AVG', db.sequelize.col('price_score')), 'avg_price'],
        [db.sequelize.fn('AVG', db.sequelize.col('service_score')), 'avg_service'],
        [db.sequelize.fn('AVG', db.sequelize.col('overall_score')), 'avg_overall'],
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total_ratings'],
      ],
      raw: true,
    });
    res.json(ratings[0] || {});
  } catch (err) {
    console.error('Error fetching supplier summary:', err);
    res.status(500).json({ error: 'Failed to fetch supplier summary' });
  }
};
