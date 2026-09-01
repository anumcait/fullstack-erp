// ETL: AUCTOR.M_MACHINE  ->  Postgres m_maintenance_machine
// Run: node backend/scripts/etl-machine-master.js

const oracledb = require('oracledb');
const { Pool } = require('pg');

const oraCfg = { user: 'AUCTOR', password: 'auctor_pass', connectString: 'localhost:1521/ORCLCDB' };
const pgPool = new Pool({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'hrdb' });

function str(v) { return v === null || v === undefined ? null : String(v).trim(); }
function num(v) { return v === null || v === undefined ? null : Number(v); }

async function main() {
  await pgPool.query('ALTER TABLE m_maintenance_machine ADD COLUMN IF NOT EXISTS attributes JSONB;');

  const conn = await oracledb.getConnection(oraCfg);
  const res = await conn.execute('SELECT * FROM AUCTOR.M_MACHINE', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
  await conn.close();
  const rows = res.rows;
  console.log(`Read ${rows.length} rows from AUCTOR.M_MACHINE`);

  const sql = `
    INSERT INTO m_maintenance_machine
      (machine_code, machine_name, machine_type, department, location, manufacturer,
       model_no, serial_no, installation_date, status, notes, created_date, updated_at, attributes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    ON CONFLICT (machine_code) DO UPDATE SET
      machine_name=EXCLUDED.machine_name, machine_type=EXCLUDED.machine_type,
      department=EXCLUDED.department, location=EXCLUDED.location,
      manufacturer=EXCLUDED.manufacturer, model_no=EXCLUDED.model_no,
      serial_no=EXCLUDED.serial_no, installation_date=EXCLUDED.installation_date,
      status=EXCLUDED.status, notes=EXCLUDED.notes,
      created_date=EXCLUDED.created_date, updated_at=EXCLUDED.updated_at,
      attributes=EXCLUDED.attributes;`;

  let inserted = 0, updated = 0;
  for (const r of rows) {
    const attrs = {};
    for (const k of Object.keys(r)) {
      if (!['MACHINE_NO', 'MACHINE_DES', 'MACHINE_TYPE', 'DEPT_CD', 'MAKE',
           'MODEL', 'MANFACT_YEAR', 'HP', 'NO_OF_SHIFTS', 'MACHINE_ONO', 'UNIT',
           'MACHINE_GRP', 'STATUS', 'SAFELOAD', 'IST_COST', 'NO_HUR', 'HUR_RAT',
           'MCH_GRP', 'SUB_GRP', 'SUB_TYP', 'TRAVERSES', 'CREATED_BY', 'CREATED_DATE',
           'UPDATE_BY', 'UPDATE_DATE'].includes(k)) {
        attrs[k] = r[k];
      }
    }
    const params = [
      str(r.MACHINE_NO), str(r.MACHINE_DES), str(r.MACHINE_TYPE), str(r.DEPT_CD),
      null, str(r.MAKE), str(r.MODEL), null,
      r.MANFACT_YEAR ? new Date(`${r.MANFACT_YEAR}-01-01`) : null,
      str(r.STATUS) === '1' ? 'Active' : 'Inactive',
      null, r.CREATED_DATE || new Date(), r.UPDATE_DATE || new Date(),
      JSON.stringify(attrs),
    ];
    const before = await pgPool.query('SELECT 1 FROM m_maintenance_machine WHERE machine_code=$1', [str(r.MACHINE_NO)]);
    await pgPool.query(sql, params);
    if (before.rowCount > 0) updated++; else inserted++;
  }

  const fin = await pgPool.query('SELECT COUNT(*)::int AS c FROM m_maintenance_machine');
  console.log(`Done. inserted=${inserted} updated=${updated} total=${fin.rows[0].c}`);
  await pgPool.end();
}

main().catch(async (e) => { console.error('ETL FAILED:', e.message); process.exit(1); });