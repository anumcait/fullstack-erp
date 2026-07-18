const db = require('../../models/ERP');
const { EngineeringSettings } = db;

exports.get = async (req, res) => {
  try {
    const settings = await EngineeringSettings.findAll();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json(map);
  } catch (err) { console.error('engSettings.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const allowed = ['bom_prefix', 'product_prefix', 'fin_year_format', 'default_version',
      'bom_hierarchy_levels', 'default_output_unit', 'enable_bom_approval'];
    for (const key of Object.keys(req.body)) {
      if (allowed.includes(key)) {
        await EngineeringSettings.upsert({ key, value: String(req.body[key]) });
      }
    }
    const settings = await EngineeringSettings.findAll();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json(map);
  } catch (err) { console.error('engSettings.update', err); res.status(500).json({ error: 'Failed' }); }
};
