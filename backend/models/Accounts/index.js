const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../../config/erpDb');

const basename = path.basename(__filename);
const db = {};

fs.readdirSync(__dirname).forEach((file) => {
  const fullPath = path.join(__dirname, file);
  if (file !== basename && file.endsWith('.js') && !file.startsWith('.')) {
    const model = require(fullPath)(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  }
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
