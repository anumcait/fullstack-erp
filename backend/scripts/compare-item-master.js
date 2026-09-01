// Compare AUCTOR.M_ITEM_MASTER (Oracle legacy) vs app m_item_master (Postgres).
// Run: node backend/scripts/compare-item-master.js
const oracledb = require('oracledb');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const oraCfg = { user: 'AUCTOR', password: 'auctor_pass', connectString: 'localhost:1521/ORCLCDB' };
const pgPool = new Pool({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'hrdb' });

function str(v) { return v === null || v === undefined ? null : String(v).trim(); }
function num(v) { return v === null || v === undefined ? null : Number(v); }
function legacyActive(v) { return !(v && ['C', 'I', '0'].includes(String(v).trim().toUpperCase())); }

async function buildCrosswalk() {
  const uomRows = await pgPool.query('SELECT id, name, short_name FROM m_unit');
  const uomMap = {};
  for (const r of uomRows.rows) {
    uomMap[str(r.name).toUpperCase()] = r.id;
    if (r.short_name) uomMap[str(r.short_name).toUpperCase()] = r.id;
  }
  uomMap['SQM'] = uomMap['SQU'];
  uomMap['ROLLS'] = uomMap['ROL'];
  return uomMap;
}

async function main() {
  // ---- Oracle (legacy) ----
  const conn = await oracledb.getConnection(oraCfg);
  const res = await conn.execute(
    'SELECT ITEM_CODE, PART_NAME, UOM, RATE, STOCK_QTY, REORDER_QTY, STATUS FROM AUCTOR.M_ITEM_MASTER',
    [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  await conn.close();
  const legacy = res.rows.map(r => ({
    code: str(r.ITEM_CODE),
    name: str(r.PART_NAME),
    uom: str(r.UOM),
    rate: num(r.RATE),
    stock: num(r.STOCK_QTY),
    reorder: num(r.REORDER_QTY),
    active: legacyActive(r.STATUS),
  }));
  console.log(`Oracle AUCTOR.M_ITEM_MASTER: ${legacy.length} rows`);

  // ---- Postgres (app) ----
  const pgRes = await pgPool.query(`
    SELECT im.item_code, im.item_name, im.unit_id, im.standard_cost, im.current_stock,
           im.reorder_qty, im.is_active, u.name AS uom_name, u.short_name AS uom_short
    FROM m_item_master im
    LEFT JOIN m_unit u ON u.id = im.unit_id
  `);
  const pg = pgRes.rows.map(r => ({
    code: str(r.item_code),
    name: str(r.item_name),
    uomName: str(r.uom_name),
    uomShort: str(r.uom_short),
    rate: num(r.standard_cost),
    stock: num(r.current_stock),
    reorder: num(r.reorder_qty),
    active: r.is_active,
  }));
  console.log(`Postgres m_item_master: ${pg.length} rows`);

  const uomMap = await buildCrosswalk();

  const pgByCode = new Map(pg.map(r => [r.code ? r.code.toUpperCase() : '', r]));
  const legByCode = new Map(legacy.map(r => [r.code ? r.code.toUpperCase() : '', r]));

  const missingInPg = [];
  const missingInOra = [];
  const diffs = [];

  const near = (a, b) => {
    if (a === null || b === null) return a === b;
    return Math.abs(Number(a) - Number(b)) < 0.01;
  };

  for (const l of legacy) {
    const p = pgByCode.get(l.code ? l.code.toUpperCase() : '');
    if (!p) { missingInPg.push(l.code); continue; }
    const pUom = (p.uomName ? p.uomName.toUpperCase() : '') || (p.uomShort ? p.uomShort.toUpperCase() : '');
    const lUomId = l.uom ? uomMap[l.uom.toUpperCase()] : null;
    const fields = [];
    if (clean(p.name) !== clean(l.name)) fields.push(`name: ora="${l.name}" pg="${p.name}"`);
    if (lUomId && p.unit_id && lUomId !== p.unit_id) fields.push(`uom: ora="${l.uom}"(${lUomId}) pg="${pUom}"(${p.unit_id})`);
    if (!near(l.rate, p.rate)) fields.push(`rate: ora=${l.rate} pg=${p.rate}`);
    if (!near(l.stock, p.stock)) fields.push(`stock: ora=${l.stock} pg=${p.stock}`);
    if (!near(l.reorder, p.reorder)) fields.push(`reorder: ora=${l.reorder} pg=${p.reorder}`);
    if (l.active !== p.active) fields.push(`active: ora=${l.active} pg=${p.active}`);
    if (fields.length) diffs.push({ code: l.code, fields });
  }

  for (const p of pg) {
    if (!legByCode.has(p.code ? p.code.toUpperCase() : '')) missingInOra.push(p.code);
  }

  console.log('\n================ COMPARISON RESULT ================');
  console.log(`Legacy rows: ${legacy.length} | App rows: ${pg.length}`);
  console.log(`Missing in App (in Oracle, not in PG): ${missingInPg.length}`);
  console.log(`Extra in App (in PG, not in Oracle): ${missingInOra.length}`);
  console.log(`Rows with field differences: ${diffs.length}`);
  console.log('==================================================\n');

  if (missingInPg.length) {
    console.log('--- Missing in App (first 20) ---');
    console.log(missingInPg.slice(0, 20).join(', '));
    console.log('');
  }
  if (missingInOra.length) {
    console.log('--- Extra in App (first 20) ---');
    console.log(missingInOra.slice(0, 20).join(', '));
    console.log('');
  }
  if (diffs.length) {
    console.log('--- Field diffs (first 30) ---');
    for (const d of diffs.slice(0, 30)) {
      console.log(`* ${d.code}`);
      d.fields.forEach(f => console.log(`    - ${f}`));
    }
  }
  if (!missingInPg.length && !missingInOra.length && !diffs.length) {
    console.log('✅ Item master data matches the AUCTOR legacy dump exactly.');
  }

  // ---- Write markdown report ----
  const now = new Date().toISOString();
  const lines = [];
  lines.push('# Item Master Comparison — AUCTOR (Oracle) vs App (Postgres)');
  lines.push('');
  lines.push(`Generated: ${now}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('| --- | --- |');
  lines.push(`| Legacy rows (AUCTOR.M_ITEM_MASTER) | ${legacy.length} |`);
  lines.push(`| App rows (m_item_master) | ${pg.length} |`);
  lines.push(`| Missing in App (in Oracle, not in PG) | ${missingInPg.length} |`);
  lines.push(`| Extra in App (in PG, not in Oracle) | ${missingInOra.length} |`);
  lines.push(`| Rows with field differences | ${diffs.length} |`);
  lines.push('');
  lines.push('## Non-matching items');
  lines.push('');

  if (!missingInPg.length && !missingInOra.length && !diffs.length) {
    lines.push('✅ All legacy items are present in the app and match exactly on name, UOM, rate, stock, reorder qty, and active status. No discrepancies found.');
    lines.push('');
  } else {
    if (missingInPg.length) {
      lines.push(`### Missing in App (present in Oracle, absent in PG) — ${missingInPg.length}`);
      lines.push('');
      missingInPg.forEach(c => lines.push(`- \`${c}\``));
      lines.push('');
    }
    if (missingInOra.length) {
      lines.push(`### Extra in App (present in PG, absent in Oracle) — ${missingInOra.length}`);
      lines.push('');
      missingInOra.forEach(c => lines.push(`- \`${c}\``));
      lines.push('');
    }
    if (diffs.length) {
      lines.push(`### Field differences — ${diffs.length}`);
      lines.push('');
      lines.push('| Item Code | Difference |');
      lines.push('| --- | --- |');
      diffs.forEach(d => {
        d.fields.forEach(f => lines.push(`| \`${d.code}\` | ${f.replace(/\|/g, '\\|')} |`));
      });
      lines.push('');
    }
  }

  const outPath = path.resolve(__dirname, '..', '..', 'items_compare.md');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`\nReport written to: ${outPath}`);

  await pgPool.end();
}

function clean(v) { return v === null || v === undefined ? '' : String(v).trim().toUpperCase(); }

main().catch(async (e) => { console.error('COMPARE FAILED:', e.message); process.exit(1); });
