// One-time seed for the TOWER FAN White Normal example (docs/test.md).
// Models sub-assemblies the "best way": each sub-assembly is its own reusable
// ProductMaster (node_type SUB_ASSEMBLY) with its own item code + BOM, and the
// parent product references it via component_product_id.
// Run from backend/:  node seed/towerFan.js   (idempotent)
const db = require('../models/ERP');
const { ProductMaster, ProductItemMaster, ItemMaster } = db;

// Top-level components. `subassembly: true` rows become standalone SUB_ASSEMBLY
// masters (with their own BOM of `children`); the parent references them.
const COMPONENTS = [
  { code: 'TF01', name: 'Normal TOP (FRONT)', qty: 1, color: 'White', make: 'Buy' },
  { code: 'TF02', name: 'BOTTOM (BACK)', qty: 1, color: 'White', make: 'Buy' },
  { code: 'TF03', name: 'SWING PLATE (Slider)', qty: 1, make: 'Buy' },
  { code: 'TF04', name: 'STOPPER PLATE', qty: 1, make: 'Buy' },
  { code: 'TF05', name: 'LOWERS', qty: 2, make: 'Buy' },
  {
    code: 'TF06', name: 'D PLATE with CAP SET Assembly', qty: 1, color: 'Black', make: 'Make', subassembly: true, children: [
      { code: 'TF0601', name: 'D plate', qty: 1, make: 'Buy' },
      { code: 'TF0602', name: 'cap set bottom', qty: 1, make: 'Buy' },
      { code: 'TF0603', name: 'cap set top', qty: 1, make: 'Buy' },
      { code: 'TF0604', name: 'derlin round part', qty: 1, make: 'Buy' },
      { code: 'TF0605', name: 'Nandus dipped in oil', qty: 1, make: 'Buy' },
      { code: 'TF0606', name: 'spring', qty: 1, make: 'Buy' },
    ],
  },
  { code: 'TF07', name: 'MOTOR BASE', qty: 1, color: 'Black', make: 'Buy' },
  {
    code: 'TF08', name: 'BLOWER Assembly', qty: 1, color: 'Black', make: 'Make', subassembly: true, children: [
      { code: 'TF0801', name: 'blower top plate', qty: 1, make: 'Buy' },
      { code: 'TF0802', name: 'pin insert for blower top plate', qty: 1, make: 'Buy' },
      { code: 'TF0803', name: 'blower bottom plate', qty: 1, make: 'Buy' },
      { code: 'TF0804', name: 'blower bush (rubber)', qty: 1, make: 'Buy' },
      { code: 'TF0805', name: 'blower sections', qty: 5, make: 'Buy' },
      { code: 'TF0806', name: 'Blower balancing pins', qty: 6, make: 'Buy' },
    ],
  },
  { code: 'TF09', name: 'Normal KNOBS', qty: 2, color: 'White', make: 'Buy' },
  { code: 'TF10', name: 'Normal on off Plate', qty: 1, make: 'Buy' },
  { code: 'TF11', name: 'RUBBER ITEMS (BOTTOM BUSH (4), GROMET(1))', qty: 5, make: 'Buy' },
  { code: 'TF12', name: 'PACKING COVERS', qty: 1, make: 'Buy' },
  { code: 'TF13', name: 'MOTOR WITH 4MFD CAPACITOR', qty: 1, make: 'Buy', remark: 'Motor Make:Nirosha/Olympus/China; Capacitor - Tibcon' },
  { code: 'TF14', name: 'SWING MOTOR WITH BUSH', qty: 1, make: 'Buy', remark: 'Sara Oscillation Motor' },
  { code: 'TF15', name: 'ON/OFF SWITCH ELCOM', qty: 1, make: 'Buy' },
  { code: 'TF16', name: '3 SPEED SWITCH ELCOM', qty: 1, make: 'Buy' },
  { code: 'TF17', name: 'POWER CORD (2.5mtr) 2 core', qty: 1, make: 'Buy' },
  { code: 'TF18', name: 'HARDWARE / PACKING (SCREWS, TIES, END CONNECTOR CAPS, NUTS, WASHERS)', qty: 1, make: 'Buy' },
  { code: 'TF19', name: 'INNER CARTON', qty: 1, make: 'Buy' },
  { code: 'TF20', name: 'Outer Carton', qty: 0.5, make: 'Buy' },
  { code: 'TF21', name: 'MANUAL & WARRANTY CARD', qty: 1, make: 'Buy' },
  { code: 'TF22', name: 'MRP AND OTHER LABELS', qty: 1, make: 'Buy' },
];

async function main() {
  const existing = await ProductMaster.findOne({ where: { product_code: 'TF-WN-01' } });
  if (existing) {
    console.log('TOWER FAN White Normal already seeded (product_code TF-WN-01). Skipping.');
    return;
  }

  // 1) Item codes for every component + child.
  const idByCode = {};
  const allNodes = [];
  COMPONENTS.forEach((c) => { allNodes.push(c); (c.children || []).forEach((ch) => allNodes.push(ch)); });
  for (const n of allNodes) {
    const [item] = await ItemMaster.findOrCreate({
      where: { item_code: n.code },
      defaults: { item_code: n.code, item_name: n.name, item_description: n.remark || null, make_buy: n.make, is_active: true },
    });
    idByCode[n.code] = item.id;
  }
  console.log(`Created/verified ${allNodes.length} item master entries.`);

  // 2) Build each sub-assembly as its own reusable SUB_ASSEMBLY master with its own BOM.
  const subProductIdByCode = {};
  for (const c of COMPONENTS.filter((x) => x.subassembly)) {
    const sub = await ProductMaster.create({
      product_code: c.code,
      part_name: c.name,
      color: c.color || null,
      node_type: 'SUB_ASSEMBLY',
      item_id: idByCode[c.code],
      is_subassembly: true,
      description: `Sub-assembly: ${c.name}`,
      is_active: true,
    });
    subProductIdByCode[c.code] = sub.id;
    for (const ch of c.children) {
      await ProductItemMaster.create({
        product_id: sub.id,
        item_id: idByCode[ch.code],
        item_code: ch.code,
        item_name: ch.name,
        quantity: ch.qty,
        is_subassembly: false,
        sort_order: 0,
      });
    }
    console.log(`Created sub-assembly master ${c.code} (${c.children.length} child items).`);
  }

  // 3) Create the parent product.
  const product = await ProductMaster.create({
    product_code: 'TF-WN-01',
    part_name: 'TOWER FAN White Normal',
    color: 'White',
    node_type: 'ASSEMBLY',
    product_type: 'FG',
    item_id: null,
    is_subassembly: true,
    description: 'TOWER FAN White Normal model. Reference BOM from docs/test.md.',
    is_active: true,
  });
  console.log(`Created parent product ${product.product_code} (id ${product.id}).`);

  // 4) Attach components. Sub-assemblies are referenced via component_product_id
  //    (their own BOM lives in the sub-assembly master); leaf items are attached directly.
  for (const c of COMPONENTS) {
    const isSub = !!c.subassembly;
    await ProductItemMaster.create({
      product_id: product.id,
      item_id: idByCode[c.code],
      item_code: c.code,
      item_name: c.name,
      quantity: c.qty,
      is_subassembly: isSub,
      component_product_id: isSub ? subProductIdByCode[c.code] : null,
      sort_order: 0,
    });
  }
  console.log('Attached component list to parent product (sub-assemblies linked via component_product_id).');
  console.log('Done.');
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
