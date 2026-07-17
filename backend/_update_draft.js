require('dotenv').config();
const { Sequelize } = require('sequelize');
(async () => {
  const seq = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST, dialect: process.env.DB_DIALECT, port: process.env.DB_PORT, logging: false,
  });
  await seq.authenticate();
  await seq.query("UPDATE t_purchase_requisition SET status = 'Draft' WHERE req_no = 'PR-2-1604'");
  const [r] = await seq.query("SELECT req_no, status FROM t_purchase_requisition WHERE req_no LIKE 'PR-2%'");
  console.log(JSON.stringify(r));
  await seq.close();
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
