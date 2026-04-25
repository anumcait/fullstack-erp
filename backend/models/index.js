const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config();

const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

// Function to recursively find model files
const loadModels = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Skip the directory itself if it's the current directory (shouldn't happen with readdirSync on __dirname)
      if (file !== 'HR' || dir === __dirname) {
         // Just a safety check, we want to enter subdirectories like HR
      }
      if (file !== 'node_modules' && !file.startsWith('.')) {
        loadModels(fullPath);
      }
    } else if (file !== basename && file.endsWith('.js') && !file.startsWith('.')) {
      console.log("Loading model:", file, "from", dir);
      const model = require(fullPath)(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    }
  });
};

loadModels(__dirname);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

console.log("✅ Loaded Models:", Object.keys(db));

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
