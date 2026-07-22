require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Sequelize } = require('sequelize');
(async () => {
  const s = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, { host: process.env.DB_HOST, dialect: 'postgres', port: process.env.DB_PORT || 5432, logging: false });
  await s.authenticate();
  const [r] = await s.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='t_production_order' ORDER BY ordinal_position");
  r.forEach(c => console.log(c.column_name + ' (' + c.data_type + ')'));
  await s.close();
})().catch(e => console.error(e.message));
