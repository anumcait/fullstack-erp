const { Client } = require('pg');
(async () => {
  const c = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'postgres', database: 'hrdb' });
  await c.connect();
  const grn = await c.query('SELECT ir_no FROM ir ORDER BY id DESC LIMIT 5');
  const po = await c.query('SELECT po_no FROM t_purchase_order ORDER BY id DESC LIMIT 5');
  const pr = await c.query('SELECT req_no FROM t_purchase_requisition ORDER BY id DESC LIMIT 5');
  const mr = await c.query('SELECT req_no FROM t_material_requisition ORDER BY id DESC LIMIT 5');
  const mi = await c.query('SELECT issue_no FROM t_material_issue ORDER BY id DESC LIMIT 5');
  console.log('GRN:', grn.rows.map(r => r.ir_no));
  console.log('PO:', po.rows.map(r => r.po_no));
  console.log('PR:', pr.rows.map(r => r.req_no));
  console.log('MR:', mr.rows.map(r => r.req_no));
  console.log('MI:', mi.rows.map(r => r.issue_no));
  await c.end();
})();
