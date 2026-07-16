const sequelize = require('./config/db');
const fs = require('fs');

async function debugRaw() {
    try {
        const [offRows] = await sequelize.query('SELECT * FROM m_emp_off_det WHERE empid = 1027');
        const [empRows] = await sequelize.query('SELECT * FROM employee_master WHERE empid = 1027');

        fs.writeFileSync('debug_output.json', JSON.stringify({
            raw_official: offRows[0] || null,
            raw_master: empRows[0] || null
        }, null, 2), 'utf-8');
        console.log("Raw SQL output written to debug_output.json");
    } catch (e) {
        console.error("Failed:", e.message);
    } finally {
        process.exit();
    }
}

debugRaw();
