const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '.env.development') });

async function check() {
  const hr = new Client({ host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const erp = new Client({ host: process.env.ERP_DB_HOST, port: parseInt(process.env.ERP_DB_PORT), user: process.env.ERP_DB_USER, password: process.env.ERP_DB_PASSWORD, database: process.env.ERP_DB_NAME });
  await hr.connect();
  await erp.connect();

  // Check Accounts tables in hrdb
  for (const t of ['chart_of_accounts', 'vouchers', 'voucher_items', 'voucher_types', 'financial_years', 'budgets', 'accounts_settings']) {
    try {
      const r = await hr.query(`SELECT COUNT(*)::int AS c FROM "${t}"`);
      console.log('hrdb.' + t + ':', r.rows[0].c, 'rows');
    } catch(e) {
      console.log('hrdb.' + t + ':', 'NOT FOUND -', e.message.slice(0, 80));
    }
  }

  // Check Accounts tables in erpdb
  for (const t of ['chart_of_accounts', 'vouchers', 'voucher_items', 'voucher_types', 'financial_years', 'budgets', 'accounts_settings']) {
    try {
      const r = await erp.query(`SELECT COUNT(*)::int AS c FROM "${t}"`);
      console.log('erpdb.' + t + ':', r.rows[0].c, 'rows');
    } catch(e) {
      console.log('erpdb.' + t + ':', 'NOT FOUND -', e.message.slice(0, 80));
    }
  }

  // Check migrated ERP tables
  for (const t of ['m_item_master', 't_purchase_order', 'm_product_master', 't_bom']) {
    try {
      const r = await erp.query(`SELECT COUNT(*)::int AS c FROM "${t}"`);
      console.log('erpdb.' + t + ':', r.rows[0].c, 'rows');
    } catch(e) {
      console.log('erpdb.' + t + ':', 'NOT FOUND');
    }
  }

  await hr.end();
  await erp.end();
}
check().catch(console.error);
