// Reclassify items out of (or into) a group using a user-supplied mapping.
// The app intentionally keeps ONE unified item master; this only fixes the
// group_id (classification) for rows that were mis-filed (e.g. components
// sitting under Finished Goods).
//
// Mapping file (JSON): array of { item_code, group }
//   e.g. [ { "item_code": "TFAN0089", "group": "Sub Assembly" }, ... ]
//   Or CSV with headers: item_code,group
//
// Usage:
//   node backend/scripts/reclassify-items.js                  # dry-run
//   node backend/scripts/reclassify-items.js --apply          # mutate
//   node backend/scripts/reclassify-items.js map.json --apply # custom file
//
// Group names are matched case-insensitively against m_item_group.name.

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pgPool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "hrdb",
});

function parseArgs() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const fileArg = args.find((a) => !a.startsWith("--"));
  const file = fileArg || path.join(__dirname, "item_reclassify_map.json");
  return { apply, file };
}

function loadMapping(file) {
  const raw = fs.readFileSync(file, "utf8");
  if (file.toLowerCase().endsWith(".csv")) {
    const lines = raw.split(/\r?\n/).filter((l) => l.trim());
    const rows = lines.slice(1).map((l) => {
      const [item_code, group] = l.split(",");
      return { item_code: (item_code || "").trim(), group: (group || "").trim() };
    });
    return rows.filter((r) => r.item_code && r.group);
  }
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error("JSON mapping must be an array of { item_code, group }");
  return data
    .map((r) => ({ item_code: String(r.item_code || "").trim(), group: String(r.group || "").trim() }))
    .filter((r) => r.item_code && r.group);
}

async function main() {
  const { apply, file } = parseArgs();
  if (!fs.existsSync(file)) {
    console.error(`Mapping file not found: ${file}`);
    process.exit(1);
  }
  const mapping = loadMapping(file);
  console.log(`Loaded ${mapping.length} mapping rows from ${file}`);
  console.log(apply ? "MODE: APPLY (mutations enabled)" : "MODE: DRY-RUN (no changes written)");

  const groups = await pgPool.query("SELECT id, name FROM m_item_group");
  const groupByName = {};
  for (const g of groups.rows) groupByName[String(g.name).toLowerCase()] = g.id;

  let matched = 0;
  let missingItem = 0;
  let missingGroup = 0;
  let changed = 0;

  for (const m of mapping) {
    const groupId = groupByName[m.group.toLowerCase()];
    if (!groupId) {
      console.log(`  SKIP ${m.item_code}: unknown group "${m.group}"`);
      missingGroup++;
      continue;
    }
    const it = await pgPool.query("SELECT id, item_code, group_id FROM m_item_master WHERE item_code = $1", [m.item_code]);
    if (it.rowCount === 0) {
      console.log(`  SKIP ${m.item_code}: item not found`);
      missingItem++;
      continue;
    }
    matched++;
    const cur = it.rows[0];
    if (cur.group_id === groupId) {
      console.log(`  OK   ${m.item_code}: already in "${m.group}"`);
      continue;
    }
    const curName = groups.rows.find((g) => g.id === cur.group_id)?.name || "(none)";
    console.log(`  ${apply ? "SET " : "WILL"} ${m.item_code}: "${curName}" -> "${m.group}"`);
    changed++;
    if (apply) {
      await pgPool.query("UPDATE m_item_master SET group_id = $1, updated_at = NOW() WHERE id = $2", [groupId, cur.id]);
    }
  }

  console.log(`\nSummary: matched=${matched} wouldChange=${changed} missingItem=${missingItem} missingGroup=${missingGroup}`);
  await pgPool.end();
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
