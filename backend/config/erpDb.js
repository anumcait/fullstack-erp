const { Sequelize } = require('sequelize');

const erpSequelize = new Sequelize(
  process.env.ERP_DB_NAME,
  process.env.ERP_DB_USER,
  process.env.ERP_DB_PASSWORD,
  {
    host: process.env.ERP_DB_HOST,
    dialect: process.env.ERP_DB_DIALECT || 'postgres',
    port: process.env.ERP_DB_PORT,
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    retry: {
      max: 5,
    },
  }
);

module.exports = erpSequelize;
