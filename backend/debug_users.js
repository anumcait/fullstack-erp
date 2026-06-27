const { User, EmployeeMaster } = require('./models');

async function debug() {
    try {
        const list = await User.findAll({
            limit: 5,
            include: [{ model: EmployeeMaster, as: 'employee' }]
        });
        console.log("Found Users:", list.map(u => ({
            username: u.username,
            empid: u.empid,
            email: u.employee?.cadd_email
        })));
    } catch (e) {
        console.error("Debug failed:", e.message);
    } finally {
        process.exit();
    }
}

debug();
