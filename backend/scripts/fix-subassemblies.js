// FIX for promote-subassemblies.js: the two phantom groups' child lines were
// not moved (parent_item_id was stale) and remained in the parent BOM, causing
// double-counting. This copies the correct child lines into the sub-BOMs and
// removes them from the parent BOM(s).
//
// Child detection (data has no usable parent_item_id):
//   D PLATE group  : rows strictly between the D-PLATE header and the BLOWER header
//   BLOWER group   : rows after the BLOWER header whose name contains 'blower'
// Sub-BOMs are shared (SUBBOM-SA0001 / SUBBOM-SA0002); children copied once.
//
// Dry-run by default; --apply to mutate.

const { Pool } = require("pg");
const pgPool = new Pool({ host: "localhost", port: 5432, user: "postgres", password: "postgres", database: "hrdb" });

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(apply ? "MODE: APPLY" : "MODE: DRY-RUN");
  const log = (m) => console.log((apply ? "  " : "  [would] ") + m);

  const subD = await pgPool.query("SELECT id FROM t_bom WHERE bom_no='SUBBOM-SA0001'");
  const subB = await pgPool.query("SELECT id FROM t_bom WHERE bom_no='SUBBOM-SA0002'");
  if (!subD.rowCount || !subB.rowCount) { console.error("sub-BOMs not found"); process.exit(1); }
  const subDId = subD.rows[0].id, subBId = subB.rows[0].id;

  const parentBoms = await pgPool.query("SELECT id, bom_no FROM t_bom WHERE product_item_id=57");

  for (const pb of parentBoms.rows) {
    const rows = await pgPool.query(
      "SELECT id, sort_order, item_name, is_phantom, item_id, item_code, quantity, unit_id, color, remarks, wastage_percent FROM t_bom_item WHERE bom_id=$1 ORDER BY sort_order, id",
      [pb.id]
    );
    const dHead = rows.rows.find((r) => r.item_name && r.item_name.toLowerCase().includes("d plate"));
    const bHead = rows.rows.find((r) => r.item_name && r.item_name.toLowerCase().includes("blower assembly"));
    if (!dHead || !bHead) { log(`skip ${pb.bom_no} (no phantom headers)`); continue; }

    const dChildren = rows.rows.filter((r) => r.sort_order > dHead.sort_order && r.sort_order < bHead.sort_order);
    const bChildren = rows.rows.filter((r) => r.sort_order > bHead.sort_order && r.item_name && r.item_name.toLowerCase().includes("blower"));

    // Copy into sub-BOM only if still empty (first parent wins); always delete from parent.
    const dEmpty = (await pgPool.query("SELECT 1 FROM t_bom_item WHERE bom_id=$1 LIMIT 1", [subDId])).rowCount === 0;
    const bEmpty = (await pgPool.query("SELECT 1 FROM t_bom_item WHERE bom_id=$1 LIMIT 1", [subBId])).rowCount === 0;

    if (dEmpty) {
      for (const c of dChildren) {
        log(`COPY -> SUBBOM-SA0001: ${c.item_code || "-"} ${c.item_name}`);
        if (apply) await pgPool.query(
          "INSERT INTO t_bom_item (bom_id, item_id, item_code, item_name, quantity, unit_id, color, remarks, wastage_percent, is_phantom) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,false)",
          [subDId, c.item_id, c.item_code, c.item_name, c.quantity, c.unit_id, c.color, c.remarks, c.wastage_percent]
        );
      }
    } else log(`SUBBOM-SA0001 already populated; skip copy for ${pb.bom_no}`);

    if (bEmpty) {
      for (const c of bChildren) {
        log(`COPY -> SUBBOM-SA0002: ${c.item_code || "-"} ${c.item_name}`);
        if (apply) await pgPool.query(
          "INSERT INTO t_bom_item (bom_id, item_id, item_code, item_name, quantity, unit_id, color, remarks, wastage_percent, is_phantom) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,false)",
          [subBId, c.item_id, c.item_code, c.item_name, c.quantity, c.unit_id, c.color, c.remarks, c.wastage_percent]
        );
      }
    } else log(`SUBBOM-SA0002 already populated; skip copy for ${pb.bom_no}`);

    const dIds = dChildren.map((c) => c.id);
    const bIds = bChildren.map((c) => c.id);
    if (dIds.length) { log(`DELETE ${dIds.length} D-plate child lines from ${pb.bom_no}`); if (apply) await pgPool.query(`DELETE FROM t_bom_item WHERE id IN (${dIds.join(",")})`); }
    if (bIds.length) { log(`DELETE ${bIds.length} blower child lines from ${pb.bom_no}`); if (apply) await pgPool.query(`DELETE FROM t_bom_item WHERE id IN (${bIds.join(",")})`); }
  }

  console.log("\nDone. Verify sub-BOMs now hold the child lines and parent no longer double-counts.");
  await pgPool.end();
}
main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
