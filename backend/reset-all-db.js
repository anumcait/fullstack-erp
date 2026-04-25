
const db = require('./models');

// Load environment variables if needed
require('dotenv').config();

const resetAllData = async () => {
    console.log('⚠️  Starting COMPLETE Database Reset...');
    console.log('This will DROP ALL TABLES and recreate them empty.');

    try {
        await db.sequelize.authenticate();
        console.log('✅ Connected to database.');

        // force: true drops tables if they exist
        await db.sequelize.sync({ force: true });

        console.log('✅ All Tables Dropped and Re-created Successfully!');
        console.log('The database is now pristine and empty.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        process.exit(1);
    }
};

resetAllData();
