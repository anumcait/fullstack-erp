const { EmployeeMaster } = require('./models');

async function debugEmp() {
    try {
        const list = await EmployeeMaster.findAll({
            where: {
                cadd_email: 'anumcait@gmail.com'
            }
        });
        console.log("Employees with that email:", list.map(e => ({
            empid: e.empid,
            ename: e.ename
        })));
    } catch (e) {
        console.error("Debug failed:", e.message);
    } finally {
        process.exit();
    }
}

debugEmp();
