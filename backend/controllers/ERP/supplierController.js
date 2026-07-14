const db = require('../../models/ERP');
const SupplierMaster = db.SupplierMaster;
const { Op } = require('sequelize');
const axios = require('axios');

const GST_API_URL = process.env.GST_API_URL;
const GST_API_KEY = process.env.GST_API_KEY;

const SETU_CLIENT_ID = process.env.SETU_CLIENT_ID;
const SETU_CLIENT_SECRET = process.env.SETU_CLIENT_SECRET;
const SETU_PRODUCT_INSTANCE_ID = process.env.SETU_PRODUCT_INSTANCE_ID;
const SETU_API_URL = process.env.SETU_API_URL || 'https://dg-sandbox.setu.co/api/verify/gst';

const GST_STATE_CODES = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh",
  "05": "Uttarakhand", "06": "Haryana", "07": "Delhi", "08": "Rajasthan",
  "09": "Uttar Pradesh", "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram", "16": "Tripura",
  "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
  "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "25": "Daman & Diu", "26": "Dadra & Nagar Haveli", "27": "Maharashtra",
  "28": "Andhra Pradesh", "29": "Karnataka", "30": "Goa", "31": "Lakshadweep",
  "32": "Kerala", "33": "Tamil Nadu", "34": "Puducherry", "35": "Andaman & Nicobar",
  "36": "Telangana", "37": "Andhra Pradesh",
};

function mockGSTLookup(gstin) {
  const pan = gstin.substring(0, 10);
  const stateCode = gstin.substring(0, 2);
  const state = GST_STATE_CODES[stateCode] || "Unknown";

  return {
    supplier_name: `[MOCK] ${state} GST Dealer`,
    supplier_code: pan,
    pan_no: pan,
    state,
    gst_registration_type: "Regular",
  };
}

exports.lookupByGSTIN = async (req, res) => {
  try {
    const { gstin } = req.params;
    if (!gstin || gstin.length < 15) return res.json({ found: false });

    const existing = await SupplierMaster.findOne({ where: { gstin } });
    if (existing) return res.json({ found: true, source: 'local', ...existing.toJSON() });

    const pan = gstin.substring(0, 10);

    // Tier 1: Setu API (POST with client credentials)
    if (SETU_CLIENT_ID && SETU_CLIENT_SECRET && SETU_PRODUCT_INSTANCE_ID) {
      try {
        const { data } = await axios.post(SETU_API_URL, { gstin }, {
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': SETU_CLIENT_ID,
            'x-client-secret': SETU_CLIENT_SECRET,
            'x-product-instance-id': SETU_PRODUCT_INSTANCE_ID,
          },
          timeout: 10000,
        });

        const c = data?.data?.company || {};
        const a = data?.data?.address?.principle || {};
        if (c?.name || c?.tradeName) {
          return res.json({
            found: true, source: 'api',
            supplier_name: c.name || c.tradeName || '',
            supplier_code: pan, pan_no: gstin.substring(2, 12),
            state: a.stateCode || GST_STATE_CODES[gstin.substring(0, 2)] || '',
            address: [a.buildingName, a.buildingNumber, a.street, a.location, a.city, a.district].filter(Boolean).join(', '),
            city: a.city || a.location || '',
            pincode: a.pinCode || '',
            gst_registration_type: c.status === 'Active' ? 'Regular' : 'Unregistered',
          });
        }
      } catch { /* fall through */ }
    }

    // Tier 2: gstverify.co.in (GET with X-API-Key header)
    if (GST_API_KEY) {
      try {
        const base = GST_API_URL || 'https://gstverify.co.in/api/v1/verify';
        const { data } = await axios.get(`${base}/${gstin}`, {
          headers: { 'X-API-Key': GST_API_KEY, 'Accept': 'application/json' },
          timeout: 8000,
        });

        const d = data?.data || data;
        if (d?.legal_name || d?.trade_name) {
          return res.json({
            found: true, source: 'api',
            supplier_name: d.legal_name || d.trade_name || '',
            supplier_code: pan, pan_no: d.pan || pan,
            state: d.state || GST_STATE_CODES[gstin.substring(0, 2)] || '',
            address: d.address || '',
            city: d.district || d.city || '',
            pincode: d.pincode || '',
            gst_registration_type: d.taxpayer_type === 'Regular' ? 'Regular' : 'Unregistered',
          });
        }
      } catch { /* fall through */ }
    }

    // Tier 3: Try GST portal public API (works from some environments)
    try {
      const { data } = await axios.get(`https://services.gst.gov.in/services/api/search/taxpayerDetails/${gstin}`, {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://services.gst.gov.in/services/search',
          'Origin': 'https://services.gst.gov.in',
        },
      });

      if (data?.lgnm || data?.tradeNam) {
        const address = data.pradr
          ? [data.pradr.bnm, data.pradr.bno, data.pradr.st, data.pradr.loc, data.pradr.dst].filter(Boolean).join(', ')
          : '';
        return res.json({
          found: true, source: 'api',
          supplier_name: data.lgnm || data.tradeNam || '',
          supplier_code: pan,
          pan_no: gstin.substring(2, 12),
          state: GST_STATE_CODES[gstin.substring(0, 2)] || '',
          gst_registration_type: data.sts === 'ACT' ? 'Regular' : 'Unregistered',
          address,
          city: data.pradr?.loc || data.pradr?.dst || '',
          pincode: data.pradr?.pncd || '',
        });
      }
    } catch { /* fall through */ }

    const mock = mockGSTLookup(gstin);
    res.json({
      found: true, source: 'mock', ...mock,
      message: 'Demo data — Set SETU_CLIENT_ID or GST_API_KEY in .env for live lookups.',
    });
  } catch (err) {
    console.error('Error looking up GSTIN:', err);
    res.status(500).json({ error: 'Failed to lookup GSTIN' });
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const { search, is_active, party_type } = req.query;
    const where = {};

    if (party_type) {
      where.party_type = party_type;
    }

    if (search) {
      where[Op.or] = [
        { supplier_code: { [Op.iLike]: `%${search}%` } },
        { supplier_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { gstin: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
        { contact_person: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const suppliers = await SupplierMaster.findAll({
      where,
      order: [['supplier_name', 'ASC']],
    });
    res.json(suppliers);
  } catch (err) {
    console.error('Error fetching parties:', err);
    res.status(500).json({ error: 'Failed to fetch parties' });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const supplier = await SupplierMaster.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Party not found' });
    res.json(supplier);
  } catch (err) {
    console.error('Error fetching party:', err);
    res.status(500).json({ error: 'Failed to fetch party' });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { supplier_code, supplier_name } = req.body;
    if (!supplier_code || !supplier_name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }

    const existing = await SupplierMaster.findOne({ where: { supplier_code } });
    if (existing) return res.status(409).json({ error: `Code '${supplier_code}' already exists` });

    const supplier = await SupplierMaster.create({ ...req.body, party_type: req.body.party_type || 'Supplier' });
    res.status(201).json(supplier);
  } catch (err) {
    console.error('Error creating party:', err);
    res.status(500).json({ error: 'Failed to create party' });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await SupplierMaster.findByPk(id);
    if (!supplier) return res.status(404).json({ error: 'Party not found' });

    const { supplier_code } = req.body;
    if (supplier_code && supplier_code !== supplier.supplier_code) {
      const dup = await SupplierMaster.findOne({ where: { supplier_code } });
      if (dup) return res.status(409).json({ error: `Code '${supplier_code}' already exists` });
    }

    await supplier.update(req.body);
    res.json(supplier);
  } catch (err) {
    console.error('Error updating party:', err);
    res.status(500).json({ error: 'Failed to update party' });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await SupplierMaster.findByPk(id);
    if (!supplier) return res.status(404).json({ error: 'Party not found' });

    await supplier.update({ is_active: false });
    res.json({ message: 'Party deactivated' });
  } catch (err) {
    console.error('Error deleting party:', err);
    res.status(500).json({ error: 'Failed to delete party' });
  }
};
