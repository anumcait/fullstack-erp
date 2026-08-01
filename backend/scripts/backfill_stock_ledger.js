/**
 * Backfill script: create an "Opening Stock" ledger entry for every existing
 * item whose current_stock > 0 but has no ledger rows yet.
 *
 * This gives historical stock / valuation from day one even for items that
 * existed before the ledger table was introduced.
 *
 * Run:  node scripts/backfill_stock_ledger.js
 */
require('dotenv').config();
const db = require('../models/ERP');

async function main() {
  await db.sequelize.authenticate();
  console.log('Connected to erpdb');

  const items = await db.ItemMaster.findAll({
    attributes: ['id', 'item_code', 'item_name', 'current_stock', 'opening_stock', 'standard_cost'],
    where: {},
  });
  console.log(`Found ${items.length} items`);

  let created = 0;
  let skipped = 0;

  const t = await db.sequelize.transaction();
  try {
    for (const item of items) {
      const onHand = Number(item.current_stock || 0);
      const existing = await db.StockLedger.findOne({ where: { item_id: item.id }, transaction: t });
      if (existing) { skipped += 1; continue; }
      if (onHand <= 0 && Number(item.opening_stock || 0) <= 0) { skipped += 1; continue; }

      const qty = Math.max(onHand, Number(item.opening_stock || 0));
      await db.StockLedger.create(
        {
          ledger_date: new Date('2020-01-01T00:00:00'),
          doc_no: `OPEN-${item.item_code}`,
          ref_type: 'Opening Stock',
          ref_no: `OPEN-${item.item_code}`,
          reference: 'Backfill from legacy stock',
          item_id: item.id,
          qty_in: qty,
          qty_out: 0,
          unit_cost: Number(item.standard_cost || 0) || null,
          stock_value: qty * (Number(item.standard_cost || 0) || 0),
          remarks: 'Opening stock (backfill)',
          created_by: 'system',
        },
        { transaction: t }
      );
      // Set current_stock to match so reconciliation stays clean
      await item.update({ current_stock: qty }, { transaction: t });
      created += 1;
    }
    await t.commit();
  } catch (err) {
    await t.rollback();
    console.error('Backfill failed:', err);
    process.exit(1);
  }

  console.log(`Created opening entries: ${created}, skipped: ${skipped}`);
  await db.sequelize.close();
  console.log('Done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
