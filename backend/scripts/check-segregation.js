// One-time consistency CHECK for the item-master segregation.
// Read-only: reports whether the classification is internally consistent with
// the product master. Does NOT mutate anything.
//
// Run: node backend/scripts/check-segregation.js

const { Pool } = require("pg");

const pgPool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "hrdb",
});

async function main() {
  const groups = await pgPool.query("SELECT id, name FROM m_item_group");
  const idByName = {};
  for (const g of groups.rows) idByName[String(g.name).toLowerCase()] = g.id;
  const fgId = idByName["finished goods"];
  const reviewId = idByName["needs review"];

  const productIds = new Set(
    (await pgPool.query("SELECT DISTINCT item_id FROM m_product_master WHERE item_id IS NOT NULL")).rows.map((r) => r.item_id)
  );
  const componentIds = new Set(
    (await pgPool.query("SELECT DISTINCT item_id FROM m_product_item_master WHERE item_id IS NOT NULL")).rows.map((r) => r.item_id)
  );

  const items = await pgPool.query("SELECT id, item_code, item_name, group_id FROM m_item_master");

  const issues = [];
  let productsOutsideFG = 0;
  let nonProductInFG = 0;
  let productInReview = 0;
  let componentInFG = 0;
  let nullGroup = 0;
  const dupMap = {};

  for (const it of items.rows) {
    const isProduct = productIds.has(it.id);
    const isComponent = componentIds.has(it.id);
    const gn = (groups.rows.find((g) => g.id === it.group_id)?.name || "").toLowerCase();

    if (it.group_id === null) { nullGroup++; issues.push(`NULL group: ${it.item_code}`); continue; }

    if (isProduct && gn !== "finished goods") {
      productsOutsideFG++;
      issues.push(`PRODUCT not in Finished Goods: ${it.item_code} (group=${gn})`);
    }
    if (!isProduct && gn === "finished goods") {
      nonProductInFG++;
      issues.push(`NON-product in Finished Goods: ${it.item_code}`);
    }
    if (isProduct && gn === "needs review") {
      productInReview++;
      issues.push(`PRODUCT sitting in Needs Review: ${it.item_code}`);
    }
    if (isComponent && gn === "finished goods") {
      componentInFG++;
      issues.push(`BOM component in Finished Goods: ${it.item_code}`);
    }
    dupMap[it.item_code] = (dupMap[it.item_code] || 0) + 1;
  }

  const dupCodes = Object.entries(dupMap).filter(([, c]) => c > 1).map(([code]) => code);

  console.log("=== Item Master Segregation Check ===");
  console.log(`Finished Goods : ${items.rows.filter((i) => i.group_id === fgId).length}`);
  console.log(`Needs Review   : ${reviewId ? items.rows.filter((i) => i.group_id === reviewId).length : "?"}`);
  console.log(`Products (product master) : ${productIds.size}`);
  console.log("");
  console.log("Checks:");
  console.log(`  Products outside Finished Goods : ${productsOutsideFG}  ${productsOutsideFG === 0 ? "OK" : "FAIL"}`);
  console.log(`  Non-products inside Finished Goods: ${nonProductInFG}  ${nonProductInFG === 0 ? "OK" : "FAIL"}`);
  console.log(`  Products inside Needs Review     : ${productInReview}  ${productInReview === 0 ? "OK" : "FAIL"}`);
  console.log(`  BOM components inside Finished Goods: ${componentInFG}  ${componentInFG === 0 ? "OK" : "FAIL"}`);
  console.log(`  Items with NULL group            : ${nullGroup}  ${nullGroup === 0 ? "OK" : "WARN"}`);
  console.log(`  Duplicate item codes             : ${dupCodes.length}  ${dupCodes.length === 0 ? "OK" : "FAIL"}`);

  if (issues.length) {
    console.log("\nDetails:");
    issues.slice(0, 50).forEach((i) => console.log("  - " + i));
    if (issues.length > 50) console.log(`  ... and ${issues.length - 50} more`);
  } else {
    console.log("\n✅ Segregation is fully consistent.");
  }

  await pgPool.end();
}

main().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
