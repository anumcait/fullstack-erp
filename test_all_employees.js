const http = require('http');

http.get('http://localhost:5000/api/employees?filterType=all', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const employees = JSON.parse(data);
            console.log('Total Employees Count:', employees.length);
            employees.forEach(emp => {
                if (emp.left_date || emp.status === 'Left' || !emp.is_active || ['Resigned', 'Terminated'].includes(emp.employment_status)) {
                    console.log(`ID: ${emp.empid}, Name: ${emp.ename}, Status: ${emp.status}, IsActive: ${emp.is_active}, EmpStatus: ${emp.employment_status}, LeftDate: ${emp.left_date}`);
                }
            });
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
