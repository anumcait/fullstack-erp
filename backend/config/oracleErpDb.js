// Oracle ERP schema connection (dedicated `erp` user).
const { createOracle } = require('./oracleFactory');
module.exports = createOracle('ORACLE_ERP_DB');
