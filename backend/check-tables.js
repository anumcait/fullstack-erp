const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/hrdb', { logging: false });

async function check() {
  try {
    const [result] = await sequelize.query("SELECT * FROM t_delivery_challan ORDER BY id DESC LIMIT 20");
    console.log('All DCs:', result);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await sequelize.close();
  }
}

check();