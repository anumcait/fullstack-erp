// Shared Oracle type-mapping + row-cleaning helpers, used by both the
// one-time mirror (scripts/mirror-schema.js) and the real-time dual-write
// replicator (services/oracleReplicator.js). Keeping it in one place avoids
// type-mapping drift between the two paths.
const Sequelize = require('sequelize');

// Map a Postgres Sequelize attribute to an Oracle-compatible definition.
function mapAttr(def) {
  const t = def.type;
  const key = (t && t.key) || '';
  let type;
  switch (key) {
    case 'INTEGER':
    case 'BIGINT':
      type = Sequelize.INTEGER;
      break;
    case 'STRING':
    case 'UUID':
    case 'ENUM':
    case 'CHAR':
    case 'CITEXT': {
      const len = (t.options && t.options.length) || (key === 'UUID' ? 36 : 255);
      // Oracle's national charset is AL16UTF16 (2 bytes/char), so NVARCHAR2
      // may hold at most 2000 chars (4000 bytes). Push anything longer to CLOB.
      type = len > 2000 ? Sequelize.TEXT : Sequelize.STRING(len);
      break;
    }
    case 'TEXT':
    case 'JSON':
    case 'JSONB':
      type = Sequelize.TEXT; // CLOB in Oracle
      break;
    case 'DATE':
    case 'DATEONLY':
      type = Sequelize.DATE;
      break;
    case 'BOOLEAN':
      type = Sequelize.INTEGER; // Oracle has no BOOLEAN; store 0/1
      break;
    case 'DECIMAL':
    case 'NUMERIC':
      type = Sequelize.DECIMAL(24, 8);
      break;
    case 'FLOAT':
    case 'DOUBLE':
    case 'REAL':
      type = Sequelize.FLOAT;
      break;
    case 'BLOB':
      type = Sequelize.BLOB;
      break;
    default:
      type = Sequelize.STRING(255);
  }

  const a = { type };
  if (def.primaryKey) a.primaryKey = true;
  if (def.autoIncrement) a.autoIncrement = true;
  // oracledb dislikes some NOT NULL without default; relax to allow inserts.
  a.allowNull = def.allowNull === false ? false : true;
  return a;
}

// A Sequelize model is an ES6 class exposing static tableName + rawAttributes.
// Excludes the sequelize/Sequelize connection objects (no tableName).
function isModel(v) {
  return v && typeof v !== 'string' && !!v.tableName && !!v.rawAttributes && typeof v.rawAttributes === 'object';
}

// True when a mapped attribute is a CLOB that originated from a JSON/JSONB column.
function isJsonColumn(def) {
  return def && def.type && /json/i.test(def.type.key || '');
}

// Convert a Postgres row (plain object) into Oracle-insertable values:
// JSON/JSONB -> stringified, BOOLEAN -> 0/1, ISO date strings -> JS Date
// (raw MERGE/SQL can't rely on Oracle's default date format, unlike O.create).
function cleanRow(jsonCols, data, dateCols) {
  const o = {};
  for (const [col, val] of Object.entries(data)) {
    if (val === undefined) continue;
    if (jsonCols && jsonCols.has(col) && val && typeof val === 'object') {
      o[col] = JSON.stringify(val);
    } else if (typeof val === 'boolean') {
      o[col] = val ? 1 : 0;
    } else if (dateCols && dateCols.has(col) && typeof val === 'string') {
      o[col] = new Date(val);
    } else {
      o[col] = val;
    }
  }
  return o;
}

module.exports = { mapAttr, isModel, isJsonColumn, cleanRow };
