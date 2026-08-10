const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/erpdb', { logging: false });

async function check() {
  try {
    const [cols] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 't_delivery_challan'");
    console.log('Columns in ERP DB:', cols.map(c => c.column_name));
    
    const [result] = await sequelize.query("SELECT * FROM t_delivery_challan ORDER BY id DESC LIMIT 20");
    console.log('All DCs in ERP DB:', result);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await sequelize.close();
  }
}

check();