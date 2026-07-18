const db = require('../../models/ERP');
const { MaintenanceSettings } = db;

exports.get = async (req, res) => {
  try {
    const rows = await MaintenanceSettings.findAll({ order: [['category', 'ASC']] });
    res.json(rows);
  } catch (err) { console.error('maintSettings.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings)) return res.status(400).json({ error: 'settings array required' });
    for (const s of settings) {
      await MaintenanceSettings.upsert({ setting_key: s.setting_key, setting_value: s.setting_value, category: s.category });
    }
    const rows = await MaintenanceSettings.findAll({ order: [['category', 'ASC']] });
    res.json(rows);
  } catch (err) { console.error('maintSettings.update', err); res.status(500).json({ error: 'Failed' }); }
};
