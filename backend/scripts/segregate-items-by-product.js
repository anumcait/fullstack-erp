// Segregate existing item codes using the PRODUCT MASTER as the source of truth.
//
// Rule:
//   - An item referenced by m_product_master.item_id  => it IS a finished product
//     => group_id must be "Finished Goods".
//   - An item currently under "Finished Goods" that is NOT a product (and not a
//     BOM component) => it was bulk-dumped there by code prefix; move it to a
//     "Needs Review" bucket so the Products tab stays clean and users curate it.
//
// Usage:
//   node backend/scripts/segregate-items-by-product.js            # dry-run
//   node backend/scripts/segregate-items-by-product.js --apply    # mutate

const { Pool } = require("pg");

const pgPool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "hrdb",
});

async function main() {
  const apply = process.argv.includes("--apply");
  console.log(apply ? "MODE: APPLY (mutations enabled)" : "MODE: DRY-RUN (no changes written)");

  const groups = await pgPool.query("SELECT id, name FROM m_item_group");
  const groupByName = {};
  for (const g of groups.rows) groupByName[String(g.name).toLowerCase()] = g.id;

  // Ensure the "Needs Review" bucket exists.
  let reviewId = groupByName["needs review"];
  if (!reviewId) {
    if (apply) {
      const ins = await pgPool.query(
        "INSERT INTO m_item_group (code, name, description, is_active) VALUES ($1,$2,$3,true) RETURNING id",
        ["REVIEW", "Needs Review", "Items bulk-classified as Finished Goods but not in the product master — curate via Item Master grid"]
      );
      reviewId = ins.rows[0].id;
      console.log("  CREATED group 'Needs Review' (id=" + reviewId + ")");
    } else {
      console.log("  WOULD CREATE group 'Needs Review' (run with --apply to create)");
    }
  }
  const fgId = groupByName["finished goods"];
  if (!fgId) { console.error('Group "Finished Goods" not found'); process.exit(1); }
  if (!reviewId && !apply) reviewId = -1; // placeholder for dry-run reporting

  // 1) Items that are products (top-level, sellable)
  const prodRes = await pgPool.query(
    "SELECT DISTINCT item_id FROM m_product_master WHERE item_id IS NOT NULL"
  );
  const productItemIds = new Set(prodRes.rows.map((r) => r.item_id));

  // 2) Items that are BOM components
  const compRes = await pgPool.query(
    "SELECT DISTINCT item_id FROM m_product_item_master WHERE item_id IS NOT NULL"
  );
  const componentItemIds = new Set(compRes.rows.map((r) => r.item_id));

  const items = await pgPool.query(
    "SELECT id, item_code, item_name, group_id FROM m_item_master"
  );

  let toFinishedGoods = 0;
  let toReview = 0;
  let productsWithoutItem = 0;

  for (const it of items.rows) {
    const isProduct = productItemIds.has(it.id);
    const inFG = it.group_id === fgId;

    if (isProduct) {
      if (!inFG) {
        const cur = groups.rows.find((g) => g.id === it.group_id)?.name || "(none)";
        console.log(`  SET  ${it.item_code}: "${cur}" -> "Finished Goods"  (is a product)`);
        toFinishedGoods++;
        if (apply) await pgPool.query("UPDATE m_item_master SET group_id=$1, updated_at=NOW() WHERE id=$2", [fgId, it.id]);
      }
      continue;
    }

    // Not a product: if it sits under Finished Goods, it does not belong there.
    if (inFG) {
      console.log(`  REVIEW ${it.item_code}: "Finished Goods" but not a product -> "Needs Review"`);
      toReview++;
      if (apply && reviewId > 0) await pgPool.query("UPDATE m_item_master SET group_id=$1, updated_at=NOW() WHERE id=$2", [reviewId, it.id]);
    }
  }

  const orphan = await pgPool.query(
    "SELECT product_code, part_name FROM m_product_master WHERE item_id IS NULL"
  );
  productsWithoutItem = orphan.rowCount;
  if (productsWithoutItem) console.log(`\n  ${productsWithoutItem} product(s) have NO linked item_id`);

  console.log(
    `\nSummary: setToFinishedGoods=${toFinishedGoods} movedToNeedsReview=${toReview} productsWithoutItem=${productsWithoutItem}`
  );
  await pgPool.end();
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
