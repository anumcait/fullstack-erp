const http = require('http');
http.get('http://localhost:5000/api/company-settings', (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
}).on('error', (e) => console.log('Error:', e.message));