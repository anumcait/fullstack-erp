// One-time DB change to support sub-assemblies living in Product Master.
//  - t_bom.product_item_id was NOT NULL; sub-assembly BOMs will now use
//    product_id (Product Master) and leave product_item_id NULL.
//  - t_bom_item gets component_product_id (FK m_product_master) so a BOM line
//    that is a sub-assembly references its Product Master Assembly record.
// Idempotent. Run once with: node db-alter-subassembly-fks.js

const { Pool } = require("pg");
const p = new Pool({ host: "localhost", port: 5432, user: "postgres", password: "postgres", database: "hrdb" });

(async () => {
  await p.query("ALTER TABLE t_bom ALTER COLUMN product_item_id DROP NOT NULL;");
  console.log("t_bom.product_item_id -> nullable");

  const col = await p.query(
    "SELECT 1 FROM information_schema.columns WHERE table_name='t_bom_item' AND column_name='component_product_id'"
  );
  if (col.rowCount === 0) {
    await p.query("ALTER TABLE t_bom_item ADD COLUMN component_product_id INTEGER;");
    console.log("t_bom_item.component_product_id added");
  } else {
    console.log("t_bom_item.component_product_id already exists");
  }

  const fk = await p.query(
    "SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_bomitem_component_product'"
  );
  if (fk.rowCount === 0) {
    await p.query(
      "ALTER TABLE t_bom_item ADD CONSTRAINT fk_bomitem_component_product FOREIGN KEY (component_product_id) REFERENCES m_product_master(id);"
    );
    console.log("FK fk_bomitem_component_product created");
  } else {
    console.log("FK fk_bomitem_component_product already exists");
  }

  await p.end();
})().catch((e) => { console.error("FAILED:", e.message); process.exit(1); });
