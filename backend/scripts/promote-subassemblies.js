// Promote the two phantom BOM groups ("D PLATE with CAP SET Assembly" and
// "BLOWER Assembly") in the NORMAL tower-fan BOM(s) into tracked Sub Assembly
// Item Master items, each with its own BOM of the child parts.
//
// For every parent BOM that contains such a phantom group:
//   - create ONE Sub Assembly item (m_item_master, group = Sub Assembly)
//   - create ONE sub-BOM (t_bom) with the child lines copied in
//   - replace the phantom line with a linked line (item_id + sub_bom_id)
//   - delete the now-moved child lines from the parent BOM
//
// Dry-run by default; --apply to mutate.

const { Pool } = require("pg");
const pgPool = new Pool({ host: "localhost", port: 5432, user: "postgres", password: "postgres", database: "hrdb" });

const PHANTOMS = [
  { match: "D PLATE", name: "D PLATE with CAP SET Assembly" },
  { match: "BLOWER", name: "BLOWER Assembly" },
];

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(apply ? "MODE: APPLY" : "MODE: DRY-RUN");
  const log = (m) => console.log((apply ? "  " : "  [would] ") + m);

  const groups = await pgPool.query("SELECT id, name FROM m_item_group");
  const subAssemblyId = groups.rows.find((g) => g.name === "Sub Assembly")?.id;
  if (!subAssemblyId) { console.error("Sub Assembly group not found"); process.exit(1); }
  const unitRes = await pgPool.query("SELECT id FROM m_unit WHERE UPPER(short_name)='NOS' OR UPPER(name)='NOS' LIMIT 1");
  const unitId = unitRes.rowCount ? unitRes.rows[0].id : null;

  // next Sub Assembly item code
  const codeRes = await pgPool.query("SELECT item_code FROM m_item_master WHERE item_code ~ '^SA[0-9]+$'");
  let maxSa = 0;
  codeRes.rows.forEach((r) => { const n = parseInt(r.item_code.replace("SA", ""), 10); if (n > maxSa) maxSa = n; });

  // find all parent BOMs that reference the NORMAL finished good (product_item_id 57)
  const parentBoms = await pgPool.query("SELECT id, bom_no FROM t_bom WHERE product_item_id = 57");
  console.log(`Parent BOMs for NORMAL finished good: ${parentBoms.rows.map((b) => b.bom_no).join(", ")}`);

  const created = {}; // group name -> { itemId, bomId }

  for (const pb of parentBoms.rows) {
    for (const ph of PHANTOMS) {
      const phantomRow = await pgPool.query(
        "SELECT id, item_name FROM t_bom_item WHERE bom_id=$1 AND is_phantom=true AND item_name ILIKE $2",
        [pb.id, `%${ph.match}%`]
      );
      if (!phantomRow.rowCount) { log(`no phantom '${ph.name}' in ${pb.bom_no}`); continue; }
      const prow = phantomRow.rows[0];

      // children of this phantom group
      const children = await pgPool.query(
        "SELECT item_id, item_code, item_name, quantity, unit_id, color, remarks, wastage_percent FROM t_bom_item WHERE bom_id=$1 AND parent_item_id=$2",
        [pb.id, prow.id]
      );

      let entry = created[ph.name];
      if (!entry) {
        maxSa += 1;
        const newCode = `SA${String(maxSa).padStart(4, "0")}`;
        log(`CREATE Sub Assembly item ${newCode} = "${ph.name}" (group=Sub Assembly)`);
        let itemId;
        if (apply) {
          const ins = await pgPool.query(
            "INSERT INTO m_item_master (item_code, item_name, group_id, unit_id, is_active, created_date, updated_at) VALUES ($1,$2,$3,$4,true,NOW(),NOW()) RETURNING id",
            [newCode, ph.name, subAssemblyId, unitId]
          );
          itemId = ins.rows[0].id;
          const bomNo = `SUBBOM-${newCode}`;
          log(`CREATE sub-BOM ${bomNo} for ${newCode}`);
          const bins = await pgPool.query(
            "INSERT INTO t_bom (bom_no, bom_name, product_item_id, product_code, product_name, status) VALUES ($1,$2,$3,$4,$5,'Active') RETURNING id",
            [bomNo, ph.name, itemId, newCode, ph.name]
          );
          const bomId = bins.rows[0].id;
          // copy children (only first time we see this group)
          for (const c of children.rows) {
            log(`  sub-BOM line: ${c.item_code || "-"} ${c.item_name} qty=${c.quantity}`);
            if (apply) {
              await pgPool.query(
                "INSERT INTO t_bom_item (bom_id, item_id, item_code, item_name, quantity, unit_id, color, remarks, wastage_percent, is_phantom) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,false)",
                [bomId, c.item_id, c.item_code, c.item_name, c.quantity, c.unit_id, c.color, c.remarks, c.wastage_percent]
              );
            }
          }
          entry = created[ph.name] = { itemId, bomId };
        } else {
          entry = created[ph.name] = { itemId: "NEW", bomId: "NEW" };
        }
      }

      // replace phantom line in this parent BOM with a linked line
      log(`REPLACE phantom '${ph.name}' in ${pb.bom_no} -> linked item ${entry.itemId}, sub_bom ${entry.bomId}`);
      if (apply) {
        await pgPool.query(
          "UPDATE t_bom_item SET is_phantom=false, item_id=$1, sub_bom_id=$2, item_name=$3, quantity=1 WHERE id=$4",
          [entry.itemId, entry.bomId, ph.name, prow.id]
        );
        // delete the moved children from the parent BOM
        await pgPool.query("DELETE FROM t_bom_item WHERE bom_id=$1 AND parent_item_id=$2", [pb.id, prow.id]);
      }
    }
  }

  console.log("\nDone (dry-run shown above; run with --apply to write).");
  await pgPool.end();
}
main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
