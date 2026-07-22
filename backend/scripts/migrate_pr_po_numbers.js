require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Sequelize } = require('sequelize');

(async () => {
  const seq = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'postgres',
      port: process.env.DB_PORT || 5432,
      logging: false,
    }
  );
  await seq.authenticate();
  console.log('Connected to DB');

  // ── 1. Renumber Purchase Requisitions ──
  const [prs] = await seq.query(
    'SELECT id, req_no FROM t_purchase_requisition ORDER BY id'
  );
  console.log(`Found ${prs.length} purchase requisitions`);
  const prMap = [];
  for (let i = 0; i < prs.length; i++) {
    const newNo = String(i + 1);
    prMap.push({ id: prs[i].id, old: prs[i].req_no, new: newNo });
  }
  for (const { id, old, new: n } of prMap) {
    if (old !== n) {
      await seq.query(
        'UPDATE t_purchase_requisition SET req_no = :req_no WHERE id = :id',
        { replacements: { req_no: n, id: id } }
      );
      console.log(`  PR #${id}: ${old} → ${n}`);
    }
  }

  // ── 2. Update pr_no references in purchase order items ──
  if (Object.keys(prMap).length > 0) {
    const [poItems] = await seq.query(
      'SELECT id, pr_no FROM t_purchase_order_item'
    );
    let updatedItems = 0;
    for (const item of poItems) {
      const entry = Object.values(prMap).find((e) => e.old === item.pr_no);
      if (entry && entry.new !== item.pr_no) {
        await seq.query(
          'UPDATE t_purchase_order_item SET pr_no = :pr_no WHERE id = :id',
          { replacements: { pr_no: entry.new, id: item.id } }
        );
        updatedItems++;
      }
    }
    console.log(`Updated ${updatedItems} PO item pr_no references`);
  }

  // ── 3. Renumber Purchase Orders ──
  const [pos] = await seq.query(
    'SELECT id, po_no FROM t_purchase_order ORDER BY id'
  );
  console.log(`Found ${pos.length} purchase orders`);
  for (let i = 0; i < pos.length; i++) {
    const newNo = String(i + 1);
    if (pos[i].po_no !== newNo) {
      await seq.query(
        'UPDATE t_purchase_order SET po_no = :po_no WHERE id = :id',
        { replacements: { po_no: newNo, id: pos[i].id } }
      );
      console.log(`  PO #${pos[i].id}: ${pos[i].po_no} → ${newNo}`);
    }
  }

  await seq.close();
  console.log('Done — all PO/PR numbers migrated to sequential 1,2,3...');
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
