// ETL: AUCTOR.M_PARTY  ->  Postgres m_party_master (single table)
// PTY_TYPE mapping:
//   SB → 'Supplier'
//   SC → 'Sub-Contractor'
//   SA → 'Customer'
// All in m_party_master with party_type distinguishing them.
// Run: node backend/scripts/etl-party-master.js

const oracledb = require('oracledb');
const { Pool } = require('pg');

const oraCfg = { user: 'AUCTOR', password: 'auctor_pass', connectString: 'localhost:1521/ORCLCDB' };
const pgPool = new Pool({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'hrdb' });

const MAPPED = new Set([
  'PTY_CODE', 'PTY_NAME', 'PTY_TYPE', 'PTY_ADD1', 'PTY_ADD2', 'PIN_CODE', 'CITY',
  'PTY_STATE', 'PHONE_NO1', 'PHONE_NO2', 'CONT_PER', 'E_MAIL', 'C_GST_NO', 'C_PAN_NO', 'C_STATUS',
]);

function str(v) { return v === null || v === undefined ? null : String(v).trim(); }
function bool(v) { return !(v && ['C', 'I', '0'].includes(String(v).trim().toUpperCase())); }

function mapPartyType(legacy) {
  const t = str(legacy)?.toUpperCase();
  if (t === 'SB') return 'Supplier';
  if (t === 'SC') return 'Sub-Contractor';
  if (t === 'SA') return 'Customer';
  return 'Supplier'; // default
}

async function main() {
  await pgPool.query('ALTER TABLE m_party_master ADD COLUMN IF NOT EXISTS attributes JSONB;');

  const conn = await oracledb.getConnection(oraCfg);
  const res = await conn.execute('SELECT * FROM AUCTOR.M_PARTY', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
  await conn.close();
  const rows = res.rows;
  console.log(`Read ${rows.length} rows from AUCTOR.M_PARTY`);

  const sql = `
    INSERT INTO m_party_master
      (supplier_code, supplier_name, party_type, contact_person, email, phone, mobile,
       address_line1, address_line2, city, state, pincode, gstin, pan_no, is_active,
       created_date, updated_at, attributes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
    ON CONFLICT (supplier_code) DO UPDATE SET
      supplier_name=EXCLUDED.supplier_name, party_type=EXCLUDED.party_type,
      contact_person=EXCLUDED.contact_person, email=EXCLUDED.email, phone=EXCLUDED.phone,
      mobile=EXCLUDED.mobile, address_line1=EXCLUDED.address_line1, address_line2=EXCLUDED.address_line2,
      city=EXCLUDED.city, state=EXCLUDED.state, pincode=EXCLUDED.pincode, gstin=EXCLUDED.gstin,
      pan_no=EXCLUDED.pan_no, is_active=EXCLUDED.is_active, created_date=EXCLUDED.created_date,
      updated_at=EXCLUDED.updated_at, attributes=EXCLUDED.attributes;`;

  let inserted = 0, updated = 0;
  const typeCounts = { Supplier: 0, 'Sub-Contractor': 0, Customer: 0 };
  for (const r of rows) {
    const attrs = {};
    for (const k of Object.keys(r)) {
      if (!MAPPED.has(k)) attrs[k] = r[k];
    }
    const partyType = mapPartyType(r.PTY_TYPE);
    typeCounts[partyType] = (typeCounts[partyType] || 0) + 1;

    const params = [
      str(r.PTY_CODE), str(r.PTY_NAME), partyType, str(r.CONT_PER), str(r.E_MAIL),
      str(r.PHONE_NO1), str(r.PHONE_NO2), str(r.PTY_ADD1), str(r.PTY_ADD2),
      str(r.CITY), str(r.PTY_STATE), str(r.PIN_CODE), str(r.C_GST_NO),
      str(r.C_PAN_NO)?.substring(0, 10),   // PAN max 10 chars
      bool(r.C_STATUS), r.C_ENTRY_DATE || null, r.C_LAST_UPDATE || null,
      JSON.stringify(attrs),
    ];
    const before = await pgPool.query('SELECT 1 FROM m_party_master WHERE supplier_code=$1', [str(r.PTY_CODE)]);
    await pgPool.query(sql, params);
    if (before.rowCount > 0) updated++; else inserted++;
  }

  const fin = await pgPool.query('SELECT party_type, COUNT(*)::int AS c FROM m_party_master GROUP BY party_type');
  console.log(`Done. inserted=${inserted} updated=${updated}`);
  console.log('By party_type:', fin.rows);
  await pgPool.end();
}

main().catch(async (e) => { console.error('ETL FAILED:', e.message); process.exit(1); });