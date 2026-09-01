const { Sequelize } = require('sequelize');

// Oracle parallel connection (legacy ERP/HR data source).
// Uses the `sequelize-oracle` dialect. If the driver is not installed yet,
// we fall back to an inert stub so the backend still boots (Oracle features
// simply stay disabled until `npm install oracledb sequelize-oracle` runs).
let sequelize;

const connectString = process.env.ORACLE_DB_CONNECT_STRING ||
  `${process.env.ORACLE_DB_HOST}:${process.env.ORACLE_DB_PORT}/${process.env.ORACLE_DB_SID}`;

function buildOracle() {
  // Registers the 'oracle' dialect with Sequelize (no-op if already present).
  require('sequelize-oracle');
  return new Sequelize(
    process.env.ORACLE_DB_USER,
    process.env.ORACLE_DB_USER,
    process.env.ORACLE_DB_PASSWORD,
    {
      host: process.env.ORACLE_DB_HOST,
      dialect: process.env.ORACLE_DB_DIALECT || 'oracle',
      port: process.env.ORACLE_DB_PORT,
      dialectOptions: { connectString },
      logging: false,
      pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
      retry: { max: 5 },
    }
  );
}

try {
  sequelize = buildOracle();
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

module.exports = sequelize;
