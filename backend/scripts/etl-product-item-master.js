// ETL: AUCTOR.M_PRODUCT_ITEM_MASTER  ->  Postgres m_product_item_master
// Links product_id + item_id via FK lookups
// Run: node backend/scripts/etl-product-item-master.js

const oracledb = require('oracledb');
const { Pool } = require('pg');

const oraCfg = { user: 'AUCTOR', password: 'auctor_pass', connectString: 'localhost:1521/ORCLCDB' };
const pgPool = new Pool({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'hrdb' });

function str(v) { return v === null || v === undefined ? null : String(v).trim(); }
function num(v) { return v === null || v === undefined ? null : Number(v); }

async function buildCrosswalks() {
  // Legacy uses numeric PRODUCT_ID (1-36) -> PG uses product_uid
  const prodRows = await pgPool.query('SELECT id, product_uid FROM m_product_master ORDER BY id');
  const prodMap = {};
  // Map by row number (1-based) since legacy PRODUCT_ID is sequential 1-36
  prodRows.rows.forEach((r, idx) => {
    prodMap[idx + 1] = r.id;  // legacy PRODUCT_ID = row position
  });

  // Legacy uses numeric ITEM_ID (1-822) -> PG uses item_code
  const itemRows = await pgPool.query('SELECT id, item_code FROM m_item_master ORDER BY id');
  const itemMap = {};
  itemRows.rows.forEach((r, idx) => {
    itemMap[idx + 1] = r.id;  // legacy ITEM_ID = row position
  });

  return { prodMap, itemMap };
}

async function main() {
  const { prodMap, itemMap } = await buildCrosswalks();
  console.log(`Product crosswalk: ${Object.keys(prodMap).length}, Item crosswalk: ${Object.keys(itemMap).length}`);

  const conn = await oracledb.getConnection(oraCfg);
  const res = await conn.execute('SELECT * FROM AUCTOR.M_PRODUCT_ITEM_MASTER', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
  await conn.close();
  const rows = res.rows;
  console.log(`Read ${rows.length} rows from AUCTOR.M_PRODUCT_ITEM_MASTER`);

  const sql = `
    INSERT INTO m_product_item_master
      (product_id, item_id, item_code, item_name, quantity, unit_id, wastage_percent, created_date, attributes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    ON CONFLICT (product_id, item_id) DO UPDATE SET
      item_code=EXCLUDED.item_code, item_name=EXCLUDED.item_name, quantity=EXCLUDED.quantity,
      unit_id=EXCLUDED.unit_id, wastage_percent=EXCLUDED.wastage_percent,
      created_date=EXCLUDED.created_date, attributes=EXCLUDED.attributes;`;

  let inserted = 0, updated = 0, missingProd = 0, missingItem = 0;
  for (const r of rows) {
    const legacyProductId = Number(r.PRODUCT_ID);
    const legacyItemId = Number(r.ITEM_ID);
    const product_id = prodMap[legacyProductId];
    const item_id = itemMap[legacyItemId];
    if (!product_id) missingProd++;
    if (!item_id) missingItem++;

    const attrs = {};
    for (const k of Object.keys(r)) {
      if (!['PRODUCT_ITEM_ID', 'PRODUCT_ID', 'ITEM_ID', 'QTY', 'WEIGHT', 'ITEM_TYPE',
           'ADD_IN_ASSEMBLY', 'SR_NO', 'QTY_PER_PALLET'].includes(k)) {
        attrs[k] = r[k];
      }
    }

    const params = [
      product_id, item_id, str(r.ITEM_ID), str(r.ITEM_ID), // item_code = ITEM_ID for now
      num(r.QTY) || 0, null, null, r.CREATED_DATE || null,
      JSON.stringify(attrs),
    ];

    if (product_id && item_id) {
      const before = await pgPool.query('SELECT 1 FROM m_product_item_master WHERE product_id=$1 AND item_id=$2', [product_id, item_id]);
      await pgPool.query(sql, params);
      if (before.rowCount > 0) updated++; else inserted++;
    }
  }

  const fin = await pgPool.query('SELECT COUNT(*)::int AS c FROM m_product_item_master');
  console.log(`Done. inserted=${inserted} updated=${updated} total=${fin.rows[0].c}`);
  console.log(`Missing product FK: ${missingProd}, Missing item FK: ${missingItem}`);
  await pgPool.end();
}

main().catch(async (e) => { console.error('ETL FAILED:', e.message); process.exit(1); });