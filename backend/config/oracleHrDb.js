// Oracle HR schema connection (dedicated `hr` user).
const { createOracle } = require('./oracleFactory');
module.exports = createOracle('ORACLE_HR_DB');
