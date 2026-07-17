const db = require('../../models/ERP');

exports.getCostCenters = async (req, res) => {
  try {
    const list = await db.CostCenter.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCostCenter = async (req, res) => {
  try {
    const cc = await db.CostCenter.create(req.body);
    res.status(201).json(cc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
