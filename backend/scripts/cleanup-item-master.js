// Dry-run analysis of item-master data quality.
// Flags: (1) blank/placeholder names, (2) Finished-Goods rows that look like components.
// Prints a proposed fix and writes item_master_cleanup.md. No data is mutated.
// Run: node backend/scripts/cleanup-item-master.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pgPool = new Pool({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'hrdb' });

const PLACEHOLDER = new Set(['-', '.', '', null, undefined]);

function titleCase(s) {
  return (s || '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
function proposeName(item) {
  if (!PLACEHOLDER.has(item.item_name)) return null; // only backfill blanks
  const parts = [];
  if (item.subgroup_name) parts.push(item.subgroup_name);
  if (item.type_name) parts.push(item.type_name);
  if (!parts.length) parts.push(item.item_code);
  return titleCase(parts.join(' '));
}
// Heuristics — conservative; only moves clearly non-finished items out of Finished Goods.
function proposeGroup(item) {
  if (item.group_name !== 'Finished Goods') return null;
  const code = (item.item_code || '').toUpperCase();
  const t = (item.type_name || '').toUpperCase();
  if (/REMOTE/.test(t)) return 'Spares';
  if (/MAGNET|PLASTIC|PARTICLE|GRANULE|PIGMENT|WHITE|MOTOR|SHEET|WIRE|CABLE|RESIN|STEEL|ALUM|COPPER|RUBBER|ADHESIVE|GREASE|OIL|CHEM|COIL|BEARING/.test(t)) return 'Raw Material';
  if (/^BLCFAN/.test(code)) return 'Raw Material';           // motor/magnet/plastic under BLCFAN = components
  if (/^GEN\d+/.test(code) && /FAN/.test(t)) return 'Sub-Assembly'; // fan components
  return null;
}

(async () => {
  const res = await pgPool.query(`
    SELECT im.item_code, im.item_name, g.name AS group_name, sg.name AS subgroup_name,
           t.name AS type_name, u.name AS uom_name, im.unit_id
    FROM m_item_master im
    LEFT JOIN m_item_group g ON g.id = im.group_id
    LEFT JOIN m_item_subgroup sg ON sg.id = im.subgroup_id
    LEFT JOIN m_item_type t ON t.id = im.type_id
    LEFT JOIN m_unit u ON u.id = im.unit_id
    ORDER BY g.name, im.item_code`);
  const rows = res.rows;

  const nameFixes = [];
  const groupFixes = [];
  for (const r of rows) {
    const nm = proposeName(r);
    if (nm) nameFixes.push({ code: r.item_code, group: r.group_name, current: r.item_name, proposed: nm });
    const grp = proposeGroup(r);
    if (grp) groupFixes.push({ code: r.item_code, type: r.type_name, current: r.group_name, proposed: grp });
  }

  console.log(`Total items: ${rows.length}`);
  console.log(`Blank/"-" names to back-fill: ${nameFixes.length}`);
  console.log(`Finished-Goods rows proposed to reclassify: ${groupFixes.length}`);

  const lines = [];
  lines.push('# Item Master Cleanup — Dry Run (no changes made)');
  lines.push('');
  lines.push(`Total items analyzed: ${rows.length}`);
  lines.push(`Blank/"-" names to back-fill: ${nameFixes.length}`);
  lines.push(`Finished-Goods rows proposed to reclassify: ${groupFixes.length}`);
  lines.push('');
  lines.push('## 1. Blank / placeholder names → proposed back-fill');
  lines.push('');
  lines.push('| Item Code | Group | Current Name | Proposed Name |');
  lines.push('| --- | --- | --- | --- |');
  nameFixes.forEach(f => lines.push(`| \`${f.code}\` | ${f.group} | ${f.current} | ${f.proposed} |`));
  lines.push('');
  lines.push('## 2. Finished-Goods rows that look like components → proposed group');
  lines.push('');
  lines.push('| Item Code | Type | Current Group | Proposed Group |');
  lines.push('| --- | --- | --- | --- |');
  groupFixes.forEach(f => lines.push(`| \`${f.code}\` | ${f.type} | ${f.current} | ${f.proposed} |`));
  lines.push('');
  lines.push('_Heuristics are conservative; review before applying. Reclassify logic can be tuned._');

  const out = path.resolve(__dirname, '..', '..', 'item_master_cleanup.md');
  fs.writeFileSync(out, lines.join('\n'), 'utf8');
  console.log(`\nReport written to: ${out}`);
  await pgPool.end();
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
