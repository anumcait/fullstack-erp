const { Sequelize } = require('sequelize');

// Builds an Oracle Sequelize instance from env vars prefixed with `prefix`
// (e.g. ORACLE_HR_DB_*, ORACLE_ERP_DB_*). If the driver isn't installed yet,
// returns an inert stub so the backend still boots (Oracle features disabled).
function createOracle(prefix) {
  let sequelize;

  const connectString = process.env[`${prefix}_CONNECT_STRING`] ||
    `${process.env[`${prefix}_HOST`]}:${process.env[`${prefix}_PORT`]}/${process.env[`${prefix}_SID`]}`;

  try {
    require('sequelize-oracle'); // registers the 'oracle' dialect
    sequelize = new Sequelize(
      process.env[`${prefix}_USER`],
      process.env[`${prefix}_USER`],
      process.env[`${prefix}_PASSWORD`],
      {
        host: process.env[`${prefix}_HOST`],
        dialect: process.env[`${prefix}_DIALECT`] || 'oracle',
        port: process.env[`${prefix}_PORT`],
        dialectOptions: { connectString },
        logging: false,
        pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
        retry: { max: 5 },
      }
    );
  } catch (err) {
    console.warn(`⚠️ Oracle driver unavailable (${err.message}). Oracle models disabled.`);
    let stubId = 0;
    sequelize = {
      define: () => ({ name: `OracleStub_${stubId++}`, associate() {} }),
      authenticate: async () => { throw new Error('oracle driver not installed'); },
      query: async () => { throw new Error('oracle driver not installed'); },
      sync: async () => {},
      close: async () => {},
      options: {},
    };
  }

  return sequelize;
}

module.exports = { createOracle };
