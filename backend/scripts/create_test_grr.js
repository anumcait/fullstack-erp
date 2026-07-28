require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.development') });
const { Op } = require('sequelize');
const db = require('../models/ERP');

async function main() {
  // Create or get test supplier
  let [supplier] = await db.SupplierMaster.findOrCreate({
    where: { supplier_code: 'TEST001' },
    defaults: { supplier_code: 'TEST001', supplier_name: 'Test Supplier', gstin: '27AABCU9603R1ZM', party_type: 'Supplier', address: 'Test Address', city: 'Test City', state: 'Test State', country: 'India', pincode: '123456', phone: '1234567890', email: 'test@test.com', active: true },
  });

  // Create or get test item
  let [item] = await db.ItemMaster.findOrCreate({
    where: { item_code: 'TEST001' },
    defaults: { item_code: 'TEST001', item_name: 'Test Item', current_stock: 100, unit_id: null, group_id: null, is_active: true },
  });

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

  console.log('Created test GRR:');
  console.log('  GRR #: ' + grn.grn_no);
  console.log('  Date: ' + grn.grn_date);
  console.log('  Supplier: ' + supplier.supplier_name);
  console.log('  Item: ' + item.item_name + ' x 10 @ 100');
  console.log('  Total: 1000');
  process.exit(0);
}

main().catch(function (err) { console.error(err); process.exit(1); });
