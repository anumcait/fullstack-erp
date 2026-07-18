const db = require('../../models/ERP');
const { ProductionSettings } = db;

exports.get = async (req, res) => {
  try {
    const settings = await ProductionSettings.findAll();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json(map);
  } catch (err) { console.error('prodSettings.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const allowed = ['order_prefix', 'fin_year_format', 'default_shift', 'default_department',
      'enable_material_issuance', 'auto_close_on_completion'];
    for (const key of Object.keys(req.body)) {
      if (allowed.includes(key)) {
        await ProductionSettings.upsert({ key, value: String(req.body[key]) });
      }
    }
    const settings = await ProductionSettings.findAll();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json(map);
  } catch (err) { console.error('prodSettings.update', err); res.status(500).json({ error: 'Failed' }); }
};
