// config/db.js
const { Sequelize } = require('sequelize');
//require('dotenv').config();

const DB_DIALECT = process.env.DB_DIALECT || 'mysql';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: DB_DIALECT,
    port: process.env.DB_PORT,
    logging: console.log,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,   // max ms to try getting a connection before throwing
      idle: 10000,       // max ms a connection can be idle before being released
      evict: 1000,       // how often to check for idle connections (ms)
    },
    retry: {
      max: 5,            // retry failed queries up to 5 times
    },
  }
);

module.exports = sequelize;
