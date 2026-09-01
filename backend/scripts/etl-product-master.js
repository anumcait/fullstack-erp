// ETL: AUCTOR.M_PRODUCT_MASTER  ->  Postgres m_product_master
// Run: node backend/scripts/etl-product-master.js

const oracledb = require('oracledb');
const { Pool } = require('pg');

const oraCfg = { user: 'AUCTOR', password: 'auctor_pass', connectString: 'localhost:1521/ORCLCDB' };
const pgPool = new Pool({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'hrdb' });

function str(v) { return v === null || v === undefined ? null : String(v).trim(); }

async function main() {
  const conn = await oracledb.getConnection(oraCfg);
  const res = await conn.execute('SELECT * FROM AUCTOR.M_PRODUCT_MASTER', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
  await conn.close();
  const rows = res.rows;
  console.log(`Read ${rows.length} rows from AUCTOR.M_PRODUCT_MASTER`);

  const sql = `
    INSERT INTO m_product_master
      (product_uid, product_type, product_code, part_name, color, description,
       finish_type, assembly_qty, is_active, created_date, updated_at, attributes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    ON CONFLICT (product_uid) DO UPDATE SET
      product_type=EXCLUDED.product_type, product_code=EXCLUDED.product_code,
      part_name=EXCLUDED.part_name, color=EXCLUDED.color, description=EXCLUDED.description,
      finish_type=EXCLUDED.finish_type, assembly_qty=EXCLUDED.assembly_qty,
      is_active=EXCLUDED.is_active, created_date=EXCLUDED.created_date,
      updated_at=EXCLUDED.updated_at, attributes=EXCLUDED.attributes;`;

  let inserted = 0, updated = 0;
  for (const r of rows) {
    const attrs = {};
    for (const k of Object.keys(r)) {
      if (!['PRODUCT_UCODE', 'PRODUCT_TYPE', 'PRODUCT_CODE', 'PART_NAME', 'PRODUCT_COLOR',
           'DESCRIPTION', 'FINISH_TYPE', 'ASSEMBLY_QTY', 'CREATED_BY', 'CREATED_DATE',
           'UPDATE_BY', 'UPDATE_DATE'].includes(k)) {
        attrs[k] = r[k];
      }
    }
    const params = [
      str(r.PRODUCT_UCODE), str(r.PRODUCT_TYPE), str(r.PRODUCT_CODE),
      str(r.PART_NAME), str(r.PRODUCT_COLOR), str(r.DESCRIPTION),
      str(r.FINISH_TYPE), Number(r.ASSEMBLY_QTY) || 1, true,
      r.CREATED_DATE || null, r.UPDATE_DATE || null,
      JSON.stringify(attrs),
    ];
    const before = await pgPool.query('SELECT 1 FROM m_product_master WHERE product_uid=$1', [str(r.PRODUCT_UCODE)]);
    await pgPool.query(sql, params);
    if (before.rowCount > 0) updated++; else inserted++;
  }

  const fin = await pgPool.query('SELECT COUNT(*)::int AS c FROM m_product_master');
  console.log(`Done. inserted=${inserted} updated=${updated} total=${fin.rows[0].c}`);
  await pgPool.end();
}

main().catch(async (e) => { console.error('ETL FAILED:', e.message); process.exit(1); });