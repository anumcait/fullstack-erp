const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '.env.development') });

async function main() {
  const hr = new Client({ host: process.env.DB_HOST, port: parseInt(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const erp = new Client({ host: process.env.ERP_DB_HOST, port: parseInt(process.env.ERP_DB_PORT), user: process.env.ERP_DB_USER, password: process.env.ERP_DB_PASSWORD, database: process.env.ERP_DB_NAME });
  await hr.connect();
  await erp.connect();

  for (const table of ['chart_of_accounts', 'voucher_types', 'financial_years']) {
    // Debug count
    const cnt = await hr.query(`SELECT COUNT(*)::int AS c FROM "${table}"`);
    console.log(table, 'in hrdb:', cnt.rows[0].c, 'rows');

    // Debug check erpdb
    try {
      const ecnt = await erp.query(`SELECT COUNT(*)::int AS c FROM "${table}"`);
      console.log(table, 'in erpdb:', ecnt.rows[0].c, 'rows');
    } catch (e) {
      console.log(table, 'NOT in erpdb:', e.message.slice(0, 80));
    }

    // Manually migrate
    const rows = await hr.query(`SELECT * FROM "${table}"`);
    const cols = Object.keys(rows.rows[0]);

    await erp.query(`SET session_replication_role = 'replica'`);

    let inserted = 0;
    for (let i = 0; i < rows.rows.length; i += 50) {
      const batch = rows.rows.slice(i, i + 50);
      const valsList = batch.map(r => {
        const vals = cols.map(c => {
          const v = r[c];
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'number') return String(v);
          if (v instanceof Date) return "'" + v.toISOString() + "'";
          return "'" + String(v).replace(/'/g, "''") + "'";
        });
        return '(' + vals.join(',') + ')';
      }).join(',');

      try {
        await erp.query(`INSERT INTO public."${table}" (${cols.map(c => '"' + c + '"').join(',')}) VALUES ${valsList} ON CONFLICT DO NOTHING`);
        inserted += batch.length;
      } catch (e) {
        console.log('  batch error:', e.message.slice(0, 100));
        for (const r of batch) {
          try {
            const vals = cols.map(c => {
              const v = r[c];
              if (v === null || v === undefined) return 'NULL';
              if (typeof v === 'number') return String(v);
              if (v instanceof Date) return "'" + v.toISOString() + "'";
              return "'" + String(v).replace(/'/g, "''") + "'";
            });
            await erp.query(`INSERT INTO public."${table}" (${cols.map(c => '"' + c + '"').join(',')}) VALUES (${vals.join(',')}) ON CONFLICT DO NOTHING`);
            inserted++;
          } catch (e2) { console.log('  row error:', e2.message.slice(0, 100)); }
        }
      }
    }

    await erp.query(`SET session_replication_role = 'origin'`);
    console.log('  migrated:', inserted, 'rows');
  }

  await hr.end();
  await erp.end();
}
main().catch(console.error);
