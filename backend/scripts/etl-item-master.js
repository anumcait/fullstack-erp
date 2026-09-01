// ETL: AUCTOR.M_ITEM_MASTER  ->  Postgres m_item_master
// Idempotent upsert on item_code. Preserves unmapped legacy cols in `attributes` JSONB.
// Handles UOM crosswalk (legacy UOM string -> m_unit.id).
// Run: node backend/scripts/etl-item-master.js

const oracledb = require('oracledb');
const { Pool } = require('pg');

const oraCfg = { user: 'AUCTOR', password: 'auctor_pass', connectString: 'localhost:1521/ORCLCDB' };
const pgPool = new Pool({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'hrdb' });

const MAPPED = new Set([
  'ITEM_CODE', 'PART_NAME', 'ITEM_DESCRIPTION', 'UOM', 'RATE', 'STOCK_QTY', 'REORDER_QTY',
  'STATUS', 'CREATED_BY', 'CREATED_DATE', 'UPDATE_BY', 'UPDATE_DATE',
]);

function str(v) { return v === null || v === undefined ? null : String(v).trim(); }
function num(v) { return v === null || v === undefined ? null : Number(v); }
function bool(v) { return !(v && ['C', 'I', '0'].includes(String(v).trim().toUpperCase())); }

async function buildCrosswalks() {
  // UOM: legacy UOM string -> m_unit.id
  const uomRows = await pgPool.query('SELECT id, name, short_name FROM m_unit');
  const uomMap = {};
  for (const r of uomRows.rows) {
    uomMap[str(r.name).toUpperCase()] = r.id;
    uomMap[str(r.short_name).toUpperCase()] = r.id;
  }
  // Legacy-specific aliases
  uomMap['SQM'] = uomMap['SQU'];    // legacy "SQM" -> Square Meter (SQU)
  uomMap['ROLLS'] = uomMap['ROL'];  // legacy "ROLLS" -> Roll (ROL)
  return { uomMap };
}

async function main() {
  const { uomMap } = await buildCrosswalks();
  console.log(`UOM crosswalk size: ${Object.keys(uomMap).length}`);

  // Read legacy
  const conn = await oracledb.getConnection(oraCfg);
  const res = await conn.execute('SELECT * FROM AUCTOR.M_ITEM_MASTER', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
  await conn.close();
  const rows = res.rows;
  console.log(`Read ${rows.length} rows from AUCTOR.M_ITEM_MASTER`);

  const insertSql = `
    INSERT INTO m_item_master
      (item_code, item_name, item_description, unit_id, standard_cost, current_stock,
       reorder_qty, is_active, created_by, created_date, updated_by, updated_at, attributes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    ON CONFLICT (item_code) DO UPDATE SET
      item_name=EXCLUDED.item_name, item_description=EXCLUDED.item_description,
      unit_id=EXCLUDED.unit_id, standard_cost=EXCLUDED.standard_cost,
      current_stock=EXCLUDED.current_stock, reorder_qty=EXCLUDED.reorder_qty,
      is_active=EXCLUDED.is_active, created_by=EXCLUDED.created_by,
      created_date=EXCLUDED.created_date, updated_by=EXCLUDED.updated_by,
      updated_at=EXCLUDED.updated_at, attributes=EXCLUDED.attributes;`;

  let inserted = 0, updated = 0, noUom = 0;
  for (const r of rows) {
    const attrs = {};
    for (const k of Object.keys(r)) {
      if (!MAPPED.has(k)) attrs[k] = r[k];
    }

    // UOM crosswalk
    const legacyUom = str(r.UOM);
    const unit_id = legacyUom ? uomMap[legacyUom.toUpperCase()] : null;
    if (legacyUom && !unit_id) noUom++;

    const params = [
      str(r.ITEM_CODE),
      str(r.PART_NAME),                      // item_name = PART_NAME
      str(r.ITEM_DESCRIPTION),
      unit_id,
      num(r.RATE),                           // standard_cost
      num(r.STOCK_QTY),                      // current_stock
      num(r.REORDER_QTY),                    // reorder_qty
      bool(r.STATUS),                        // is_active ('A' = true)
      num(r.CREATED_BY),
      r.CREATED_DATE || null,
      num(r.UPDATE_BY),
      r.UPDATE_DATE || null,
      JSON.stringify(attrs),
    ];

    const before = await pgPool.query('SELECT 1 FROM m_item_master WHERE item_code=$1', [str(r.ITEM_CODE)]);
    try {
      await pgPool.query(insertSql, params);
    } catch (e) {
      console.error('FAILED row:', r.ITEM_CODE, e.message);
      throw e;
    }
    if (before.rowCount > 0) updated++; else inserted++;
  }

  const fin = await pgPool.query('SELECT COUNT(*)::int AS c FROM m_item_master');
  console.log(`Done. inserted=${inserted} updated=${updated} total=${fin.rows[0].c} noUomMatch=${noUom}`);
  await pgPool.end();
}

main().catch(async (e) => { console.error('ETL FAILED:', e.message); process.exit(1); });