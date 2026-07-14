const db = require('../../models/ERP');
const StoresSettings = db.StoresSettings;

exports.getSettings = async (req, res) => {
  try {
    let settings = await StoresSettings.findByPk(1);
    if (!settings) {
      settings = await StoresSettings.create({ id: 1 });
    }
    res.json(settings);
  } catch (err) {
    console.error('Error fetching stores settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await StoresSettings.findByPk(1);
    if (!settings) {
      settings = await StoresSettings.create({ id: 1, ...req.body });
    } else {
      await settings.update(req.body);
    }
    res.json(settings);
  } catch (err) {
    console.error('Error updating stores settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
