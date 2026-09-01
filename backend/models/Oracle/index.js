// Oracle models, each bound to its own dedicated schema connection:
//   HR.LEGACY_HR_EMPLOYEES  -> ORACLE_HR_DB  (user `hr`)
//   ERP.LEGACY_ERP_ITEMS    -> ORACLE_ERP_DB (user `erp`)
// Mirrors how Postgres splits HR and ERP into separate databases.
const LegacyHrEmployee = require('./LegacyHrEmployee');
const LegacyErpItem = require('./LegacyErpItem');
const sequelizeHr = require('../../config/oracleHrDb');
const sequelizeErp = require('../../config/oracleErpDb');
const Sequelize = require('sequelize');

const db = {};
db.LegacyHrEmployee = LegacyHrEmployee(sequelizeHr, Sequelize.DataTypes);
db.LegacyErpItem = LegacyErpItem(sequelizeErp, Sequelize.DataTypes);

db.sequelizeHr = sequelizeHr;
db.sequelizeErp = sequelizeErp;
db.Sequelize = Sequelize;
module.exports = db;
