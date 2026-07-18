const db = require('../../models/ERP');
const { MarketingSettings } = db;

exports.get = async (req, res) => {
  try {
    const settings = await MarketingSettings.findAll();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json({ settings: map });
  } catch (err) { console.error('mktSettings.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const allowed = ['default_discount', 'tax_rate', 'quote_validity_days', 'sales_regions', 'payment_terms'];
    for (const key of Object.keys(req.body)) {
      if (allowed.includes(key)) {
        await MarketingSettings.upsert({ key, value: String(req.body[key]) });
      }
    }
    const settings = await MarketingSettings.findAll();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json({ settings: map });
  } catch (err) { console.error('mktSettings.update', err); res.status(500).json({ error: 'Failed' }); }
};
