// Move sub-assemblies from Item Master to Product Master.
// For every Item Master item with group = 'Sub Assembly':
//   1. Ensure a m_product_master record (product_type='Assembly') exists.
//   2. Repoint its sub-BOM header(s) to product_id (Product Master) and NULL product_item_id.
//   3. Repoint every t_bom_item line that referenced the item: item_id -> NULL,
//      component_product_id -> the new Product Master Assembly.
//   4. Delete the now-orphaned Item Master item (only if nothing else references it).
//
// Dry-run by default; --apply to mutate.

const { Pool } = require("pg");
const p = new Pool({ host: "localhost", port: 5432, user: "postgres", password: "postgres", database: "hrdb" });

async function referencesElsewhere(pool, itemId, skipTables) {
  const fks = await pool.query(`
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'm_item_master'
  `);
  for (const fk of fks.rows) {
    if (skipTables.includes(fk.table_name)) continue;
    try {
      const r = await pool.query(`SELECT 1 FROM ${fk.table_name} WHERE ${fk.column_name} = $1 LIMIT 1`, [itemId]);
      if (r.rowCount > 0) return `${fk.table_name}.${fk.column_name}`;
    } catch (_) { /* table/column may not exist in this shape */ }
  }
  return null;
}

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(apply ? "MODE: APPLY" : "MODE: DRY-RUN");
  const log = (m) => console.log((apply ? "  " : "  [would] ") + m);

  const grp = await p.query("SELECT id FROM m_item_group WHERE name ILIKE '%sub%assembly%' LIMIT 1");
  if (!grp.rowCount) { console.error("Sub Assembly group not found in m_item_group"); await p.end(); return; }
  const groupId = grp.rows[0].id;
  console.log("Sub Assembly group_id =", groupId);

  const items = await p.query("SELECT id, item_code, item_name FROM m_item_master WHERE group_id = $1 ORDER BY id", [groupId]);
  console.log(`Found ${items.rowCount} Sub Assembly items`);
  if (items.rowCount === 0) { await p.end(); return; }

  const baseSeq = (await p.query("SELECT COALESCE(MAX(id),0)+1 AS n FROM m_product_master")).rows[0].n;
  let seq = baseSeq;

  for (const it of items.rows) {
    // 1. ensure product
    let prod = await p.query("SELECT id, product_uid, product_code, part_name FROM m_product_master WHERE product_code = $1 OR item_id = $2 LIMIT 1", [it.item_code, it.id]);
    let prodId;
    if (prod.rowCount) {
      prodId = prod.rows[0].id;
      log(`Product exists for ${it.item_code}: id=${prodId} (${prod.rows[0].product_uid})`);
    } else {
      let uid = "ASM" + String(seq++).padStart(4, "0");
      while (true) {
        const ex = await p.query("SELECT 1 FROM m_product_master WHERE product_uid = $1", [uid]);
        if (ex.rowCount === 0) break;
        uid = "ASM" + String(seq++).padStart(4, "0");
      }
      log(`CREATE Product Master Assembly: ${uid} <- ${it.item_code} ${it.item_name}`);
      if (apply) {
        const ins = await p.query(
          "INSERT INTO m_product_master (product_uid, product_type, node_type, product_code, part_name, is_active, created_date, updated_at) VALUES ($1,'Assembly','SKU',$2,$3,true,NOW(),NOW()) RETURNING id",
          [uid, it.item_code, it.item_name]
        );
        prodId = ins.rows[0].id;
      }
    }

    // 2. repoint sub-BOM headers
    const boms = await p.query("SELECT id, bom_no FROM t_bom WHERE product_item_id = $1", [it.id]);
    for (const b of boms.rows) {
      log(`REPOINT BOM ${b.bom_no}: product_id=${prodId}, product_item_id=NULL`);
      if (apply) await p.query("UPDATE t_bom SET product_id=$1, product_item_id=NULL, product_code=$2, product_name=$3 WHERE id=$4", [prodId, it.item_code, it.item_name, b.id]);
    }

    // 3. repoint BOM component lines
    const lines = await p.query("SELECT id, bom_id, sub_bom_id FROM t_bom_item WHERE item_id = $1", [it.id]);
    if (lines.rowCount) {
      log(`REPOINT ${lines.rowCount} BOM component line(s) -> component_product_id=${prodId}, item_id=NULL`);
      if (apply) await p.query("UPDATE t_bom_item SET item_id=NULL, component_product_id=$1 WHERE item_id=$2", [prodId, it.id]);
    }

    // 4. delete item if safe
    const blocker = await referencesElsewhere(p, it.id, ["t_bom_item"]);
    if (blocker) {
      log(`KEEP item ${it.item_code} (still referenced by ${blocker})`);
    } else {
      log(`DELETE Item Master ${it.item_code} (id=${it.id})`);
      if (apply) await p.query("DELETE FROM m_item_master WHERE id=$1", [it.id]);
    }
  }

  console.log("\nDone. Sub-assemblies now live in Product Master.");
  await p.end();
}
main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
