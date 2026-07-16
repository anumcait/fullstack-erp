const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const XLSX = require('xlsx');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.development') });

const erpDb = require('../models/ERP');

const num = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = parseFloat(String(v).replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
};

const trunc = (v, n) => {
  const s = U(v);
  return s.length > n ? s.slice(0, n) : s;
};

const U = (v) => (v === null || v === undefined ? '' : String(v).toString().trim());
const upper = (v) => U(v).toUpperCase();

// ── Group derivation (ITEM_CODE prefix wins for fans; else ITEM_TYPE keywords) ──
function deriveGroup(row) {
  const t = upper(row.ITEM_TYPE);
  const code = upper(row.ITEM_CODE);
  if (/^TFAN|^VFAN|^BLDCFAN|^AEROSPIN/.test(code)) return 'Finished Goods';
  if (/(TFAN|VFAN|BLDCFAN|FAN|AEROSPIN)/.test(t)) return 'Finished Goods';
  const has = (kws) => kws.some((k) => t.includes(k));
  if (has(['BLADE', 'BASE', 'BEARING', 'SPARE'])) return 'Spares';
  if (has(['BOX', 'COVER', 'POLYBAG', 'LABEL', 'STICKER', 'TAPE', 'STRAP', 'RIBBON', 'THERMOCOLE', 'CARTON', 'BAG', 'WRAP']))
    return 'Packing Material';
  if (has(['STATIONARY', 'PRINTER', 'DRAWINGS', 'SAFETY', 'TOOL', 'SPANNER', 'MACHINE', 'MOULD', 'MARKER', 'PEN', 'PENCIL']))
    return 'Consumables';
  if (has(['MOTOR', 'CAPACITOR', 'WIRE', 'CABLE', 'RELAY', 'CONTACTOR', 'SWITCH', 'METER', 'SCREW', 'PIN', 'BUSH', 'SPRING', 'LUG', 'WASHER', 'HARDWARE', 'PLATE', 'PANEL', 'UNIRAC', 'LOWER', 'HEATER', 'SPRAY', 'ADHESIVE']))
    return 'Sub Assembly';
  if (has(['SHEET', 'PIPE', 'GRANULE', 'MATERIAL', 'SILICONE', 'CEMENT', 'CLOTH', 'RUBBER', 'POWDER', 'RESIN', 'GASKET']))
    return 'Raw Material';
  if (/^MAT/.test(code)) return 'Raw Material';
  return 'Raw Material';
}

// ── Type name (ITEM_TYPE, or code-prefix for fans whose ITEM_TYPE is null) ──
function deriveTypeName(row) {
  const t = upper(row.ITEM_TYPE);
  if (t) return t;
  const code = upper(row.ITEM_CODE);
  if (code.startsWith('TFAN')) return 'TOWER FAN';
  if (code.startsWith('VFAN')) return 'VENTILATION FAN';
  if (code.startsWith('BLDCFAN') || code.startsWith('AEROSPIN')) return 'BLDC FAN';
  return 'GENERAL';
}

// ── Sub Group derivation (mid bucket within group) ──
function deriveSubGroup(group, row) {
  const t = upper(row.ITEM_TYPE);
  const code = upper(row.ITEM_CODE);
  const has = (kws) => kws.some((k) => t.includes(k) || code.includes(k));
  const map = {
    'Finished Goods': { TFAN: 'Tower Fan', VFAN: 'Ventilation Fan', BLDCFAN: 'BLDC Fan', AEROSPIN: 'BLDC Fan', FAN: 'Fan' },
    'Packing Material': { BOX: 'Boxes', COVER: 'Covers', POLYBAG: 'Bags', LABEL: 'Labels', STICKER: 'Labels', TAPE: 'Wrapping', STRAP: 'Wrapping', RIBBON: 'Wrapping', THERMOCOLE: 'Cushioning' },
    'Consumables': { STATIONARY: 'Stationery', PRINTER: 'Stationery', DRAWINGS: 'Stationery', SAFETY: 'Safety', TOOL: 'Tools', SPANNER: 'Tools', MACHINE: 'Machinery', MOULD: 'Tooling' },
    'Sub Assembly': { MOTOR: 'Electrical', CAPACITOR: 'Electrical', WIRE: 'Electrical', CABLE: 'Electrical', RELAY: 'Electrical', CONTACTOR: 'Electrical', SWITCH: 'Electrical', METER: 'Electrical', HEATER: 'Electrical', SHEET: 'Sheet Metal', PIPE: 'Metal', PLATE: 'Sheet Metal', PANEL: 'Sheet Metal', SCREW: 'Hardware', PIN: 'Hardware', BUSH: 'Hardware', SPRING: 'Hardware', LUG: 'Hardware', WASHER: 'Hardware', HARDWARE: 'Hardware', UNIRAC: 'Hardware', LOWER: 'Hardware' },
    'Raw Material': { SHEET: 'Metal', PIPE: 'Metal', GRANULE: 'Polymer', MATERIAL: 'General', SILICONE: 'Chemical', CEMENT: 'Chemical', CLOTH: 'Polymer' },
    Spares: { BLADE: 'Blades', BASE: 'Bases', BEARING: 'Bearings' },
  };
  const m = map[group] || {};
  for (const k of Object.keys(m)) if (has([k])) return m[k];
  return 'General';
}

// ── Variant (Sub Type) parsed from parentheses in the display name ──
function parseVariant(name) {
  const m = U(name).match(/\(([^)]+)\)/);
  return m ? m[1].trim() : 'Standard';
}

function itemName(row) {
  const d = U(row.ITEM_DESCRIPTION);
  const p = U(row.PART_NAME);
  if (d && d !== '.' && d !== '-') return d;
  if (p && p !== '.' && p !== '-') return p;
  return U(row.ITEM_CODE);
}

// ── UOM normalization ──
const UOM_MAP = {
  NOS: 'Nos', PCS: 'Pieces', KGS: 'Kilogram', KG: 'Kilogram', TON: 'Ton',
  SET: 'Set', ROLLS: 'Roll', ROL: 'Roll', LTR: 'Liter', BOX: 'Box',
  PAC: 'Pack', SQM: 'Square Meter', MTR: 'Meter', CMT: 'Centimeter', GRM: 'Gram',
};
function unitName(uom) {
  const u = upper(uom);
  if (UOM_MAP[u]) return UOM_MAP[u];
  if (!u) return 'Nos';
  return u.charAt(0) + u.slice(1).toLowerCase();
}

async function main() {
  erpDb.sequelize.options.logging = false;
  await erpDb.sequelize.authenticate();
  console.log('✅ DB connected');

  // Widen classification/name columns so long legacy descriptions fit (idempotent)
  const alters = [
    `ALTER TABLE m_item_subtype ALTER COLUMN name TYPE VARCHAR(255)`,
    `ALTER TABLE m_item_type ALTER COLUMN name TYPE VARCHAR(255)`,
    `ALTER TABLE m_item_subgroup ALTER COLUMN name TYPE VARCHAR(255)`,
    `ALTER TABLE m_item_master ALTER COLUMN item_name TYPE VARCHAR(255)`,
    `ALTER TABLE m_item_master ALTER COLUMN item_code TYPE VARCHAR(50)`,
  ];
  for (const sql of alters) {
    try { await erpDb.sequelize.query(sql); } catch (_) { /* ignore */ }
  }

  const { ItemGroup, ItemSubGroup, ItemType, ItemSubType, Unit, ItemMaster } = erpDb;

  const file = process.env.ITEM_XLS || path.resolve(__dirname, '..', '..', 'reference', 'item_master.xls');
  const wb = XLSX.readFile(file);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: null });
  console.log(`📥 Loaded ${rows.length} rows from Excel`);

  const foc = async (Model, where, defaults, t) => {
    const found = await Model.findOne({ where, transaction: t });
    if (found) return found;
    try {
      return await Model.create(defaults, { transaction: t });
    } catch (e) {
      const retry = await Model.findOne({ where, transaction: t });
      if (retry) return retry;
      console.error(`❌ create failed for ${Model.name}:`, e.parent ? e.parent.message : e.message, 'where=', JSON.stringify(where));
      throw e;
    }
  };

  let created = 0, updated = 0, skipped = 0;
  const stats = { groups: {}, subgroups: {}, types: {}, subtypes: {}, units: {} };

  await erpDb.sequelize.transaction(async (t) => {
    // Pin this connection's search_path so unqualified names resolve to public.
    await erpDb.sequelize.query('SET search_path TO public, pg_catalog', { transaction: t });

    for (const row of rows) {
      const itemCode = U(row.ITEM_CODE);
      if (!itemCode) { skipped++; continue; }

      const groupName = trunc(deriveGroup(row), 100);
      const subGroupName = trunc(deriveSubGroup(groupName, row), 255);
      const typeName = trunc(deriveTypeName(row), 255);
      const name = trunc(itemName(row), 255);
      const variant = trunc(parseVariant(name), 255);
      const uName = trunc(unitName(row.UOM), 50);

      const group = await foc(ItemGroup, { name: groupName }, { name: groupName, is_active: true }, t);
      stats.groups[groupName] = (stats.groups[groupName] || 0) + 1;

      const subGroup = await foc(ItemSubGroup, { name: subGroupName, group_id: group.id }, { name: subGroupName, group_id: group.id, is_active: true }, t);
      stats.subgroups[subGroupName] = (stats.subgroups[subGroupName] || 0) + 1;

      const type = await foc(ItemType, { name: typeName, subgroup_id: subGroup.id }, { name: typeName, subgroup_id: subGroup.id, is_active: true }, t);
      stats.types[typeName] = (stats.types[typeName] || 0) + 1;

      const subType = await foc(ItemSubType, { name: variant, type_id: type.id }, { name: variant, type_id: type.id, is_active: true }, t);
      stats.subtypes[variant] = (stats.subtypes[variant] || 0) + 1;

      const unit = await foc(Unit, { name: uName }, { name: uName, short_name: trunc(uName, 3).toUpperCase(), is_active: true }, t);
      stats.units[uName] = (stats.units[uName] || 0) + 1;

      const cat = U(row.ITEM_CAT);
      const abc = ['A', 'B', 'C'].includes(cat) ? cat : null;

      const payload = {
        item_code: trunc(itemCode, 50),
        item_name: name,
        item_description: U(row.ITEM_DESCRIPTION) || null,
        group_id: group.id,
        subgroup_id: subGroup.id,
        type_id: type.id,
        subtype_id: subType.id,
        unit_id: unit.id,
        hsn_code: null,
        gst_rate: 0,
        opening_stock: num(row.STOCK_QTY),
        current_stock: num(row.STOCK_QTY),
        min_stock: 0,
        max_stock: 0,
        reorder_level: 0,
        min_order_qty: 0,
        reorder_qty: num(row.REORDER_QTY),
        lead_time_days: null,
        abc_class: abc,
        valuation_method: 'Moving Average',
        standard_cost: num(row.RATE),
        last_purchase_cost: num(row.RATE),
        moving_average_cost: num(row.RATE),
        mrp: 0,
        is_active: true,
      };

      const existing = await ItemMaster.findOne({ where: { item_code: itemCode }, transaction: t });
      if (!existing) {
        await ItemMaster.create(payload, { transaction: t });
        created++;
      } else {
        await existing.update(payload, { transaction: t });
        updated++;
      }
    }
  });


  console.log(`✅ Import done. created=${created} updated=${updated} skipped=${skipped}`);
  const total = await ItemMaster.count();
  console.log(`📦 Total items in m_item_master: ${total}`);
  console.log('Groups:', JSON.stringify(stats.groups));
  console.log('SubGroups:', JSON.stringify(stats.subgroups));
  console.log('Types (count):', Object.keys(stats.types).length);
  console.log('SubTypes (count):', Object.keys(stats.subtypes).length);
  console.log('Units:', JSON.stringify(stats.units));

  await erpDb.sequelize.close();
}

main().catch((e) => {
  console.error('❌ Import failed:', e);
  process.exit(1);
});
