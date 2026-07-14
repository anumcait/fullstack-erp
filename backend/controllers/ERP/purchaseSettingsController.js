const db = require('../../models/ERP');

const PurchaseSettings = db.PurchaseSettings;

exports.getSettings = async (req, res) => {
  try {
    let settings = await PurchaseSettings.findByPk(1);
    if (!settings) {
      settings = await PurchaseSettings.create({ id: 1 });
    }
    res.json(settings);
  } catch (err) {
    console.error('Error fetching purchase settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const [updated] = await PurchaseSettings.update(req.body, { where: { id: 1 } });
    if (!updated) await PurchaseSettings.create({ id: 1, ...req.body });
    const settings = await PurchaseSettings.findByPk(1);
    res.json(settings);
  } catch (err) {
    console.error('Error updating purchase settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
