const db = require('../../models/ERP');
const { QualitySettings } = db;

exports.get = async (req, res) => {
  try {
    const settings = await QualitySettings.findAll();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json(map);
  } catch (err) { console.error('qualSettings.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const allowed = ['inspection_prefix_iqc', 'inspection_prefix_ipc', 'inspection_prefix_fqc',
      'nc_prefix', 'defect_tolerance_percent', 'sampling_plan', 'inspection_parameters'];
    for (const key of Object.keys(req.body)) {
      if (allowed.includes(key)) {
        await QualitySettings.upsert({ key, value: String(req.body[key]) });
      }
    }
    const settings = await QualitySettings.findAll();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json(map);
  } catch (err) { console.error('qualSettings.update', err); res.status(500).json({ error: 'Failed' }); }
};
