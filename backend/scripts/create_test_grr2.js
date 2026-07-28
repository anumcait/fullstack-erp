require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.development') });
const { Op } = require('sequelize');
const db = require('../models/ERP');

async function main() {
  // Find existing supplier
  let suppliers = await db.SupplierMaster.findAll({ limit: 1, where: { party_type: 'Supplier' } });
  if (suppliers.length === 0) {
    console.log('No suppliers found. Create one first.');
    process.exit(1);
  }
  let supplier = suppliers[0];
  console.log('Using supplier: ' + supplier.supplier_name + ' (id=' + supplier.id + ')');

  // Find or create item
  let [item, created] = await db.ItemMaster.findOrCreate({
    where: { item_code: 'TEST001' },
    defaults: { item_code: 'TEST001', item_name: 'Test Item', current_stock: 100, is_active: true },
  });
  console.log('Using item: ' + item.item_name + ' (id=' + item.id + ')');

  // Create GRR with datetime
  var now = new Date();
  var grn = await db.GRN.create({
    grn_no: 'GRR-TEST-' + now.getTime(),
    grn_date: now,
    status: 'Received',
    ir_type: 'GRR',
    supplier_id: supplier.id,
    received_by: 'System',
  });

  await db.GRNItem.create({
    grn_id: grn.id,
    item_id: item.id,
    item_code: item.item_code,
    item_name: item.item_name,
    accepted_qty: 10,
    rate: 100,
    amount: 1000,
    gst_rate: 18,
    gst_amount: 180,
    uom: 'NOS',
  });

  console.log('\nTest GRR created successfully!');
  console.log('  GRR #: ' + grn.grn_no);
  console.log('  Date: ' + grn.grn_date);
  console.log('  Supplier: ' + supplier.supplier_name);
  console.log('  Item: ' + item.item_name + ' x 10 @ 100');
  console.log('  Amount: 1000, GST: 180, Total: 1180');
  process.exit(0);
}

main().catch(function (err) { console.error('Error:', err.message || err); process.exit(1); });
