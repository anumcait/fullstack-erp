const http = require('http');

http.get('http://localhost:5000/api/employees?filterType=left', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const employees = JSON.parse(data);
            console.log('Left Employees Count:', employees.length);
            employees.forEach(emp => {
                console.log(`ID: ${emp.empid}, Name: ${emp.ename}, Status: ${emp.status}, IsActive: ${emp.is_active}, EmploymentStatus: ${emp.employment_status}`);
            });
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw Data:', data);
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
