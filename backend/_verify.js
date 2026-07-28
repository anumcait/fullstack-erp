const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '.env.development') });

async function check() {
  const erp = new Client({ host: process.env.ERP_DB_HOST, port: parseInt(process.env.ERP_DB_PORT), user: process.env.ERP_DB_USER, password: process.env.ERP_DB_PASSWORD, database: process.env.ERP_DB_NAME });
  await erp.connect();

  const tables = ['m_item_master', 'm_party_master', 't_purchase_order', 'm_product_master', 't_bom', 't_material_requisition', 'chart_of_accounts', 'voucher_types', 'financial_years'];
  for (const t of tables) {
    try {
      const r = await erp.query(`SELECT COUNT(*)::int AS c FROM "${t}"`);
      console.log(t + ': ' + r.rows[0].c + ' rows');
    } catch(e) {
      console.log(t + ': ERROR - ' + e.message.slice(0, 60));
    }
  }

  await erp.end();
}
check().catch(console.error);
