const db = require('../../models/ERP');
const { PlanningSettings } = db;

exports.get = async (req, res) => {
  try {
    const rows = await PlanningSettings.findAll({ order: [['category', 'ASC']] });
    res.json(rows);
  } catch (err) { console.error('planSettings.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings)) return res.status(400).json({ error: 'settings array required' });
    for (const s of settings) {
      await PlanningSettings.upsert({ setting_key: s.setting_key, setting_value: s.setting_value, category: s.category });
    }
    const rows = await PlanningSettings.findAll({ order: [['category', 'ASC']] });
    res.json(rows);
  } catch (err) { console.error('planSettings.update', err); res.status(500).json({ error: 'Failed' }); }
};
