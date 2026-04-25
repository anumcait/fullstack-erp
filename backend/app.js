const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const client = require('prom-client');
client.collectDefaultMetrics();

require('dotenv').config(); // make sure .env is loaded before using

const employeeRoutes = require('./routes/HR/employeeRoutes');
const leaveRoutes = require('./routes/HR/leaveRoutes');
const ondutyRoutes = require('./routes/HR/ondutyRoutes');
const shiftRoutes = require('./routes/HR/shiftRoutes');
const jasperRoutes = require('./routes/jasperRoutes');
// const gptRoutes = require('./routes/gptRoutes'); // Disabled LLM features
const dashboardRoutes = require('./routes/HR/dashboardRoutes');
const tourRoutes = require('./routes/HR/tourRoutes');
const woffRoutes = require('./routes/HR/woffRoutes');
const advanceRoutes = require('./routes/HR/advanceRoutes');
const esiLeaveRoutes = require('./routes/HR/esiLeaveRoutes');
const payrollRoutes = require('./routes/HR/payrollRoutes');
const attendanceRoutes = require('./routes/HR/attendanceRoutes');
const holidayRoutes = require('./routes/HR/holidayRoutes');
const extOtRoutes = require('./routes/HR/extOtRoutes');


const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost',
  'http://localhost:5173',
  'http://localhost:5000',
  process.env.FRONTEND_URL,   // set this in .env for production
].filter(Boolean);

// Middlewares
app.use(cors({
  origin: true, // Dynamically allow any requesting origin (perfect for 'run anywhere')
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session middleware
// app.use(session({
//   secret: process.env.SESSION_SECRET || 'default_session_secret',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: false, // true if using HTTPS
//     httpOnly: true,
//     maxAge: 1000 * 60 * 60 * 2 // 2 hours
//   }
// }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true with HTTPS in prod
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/onduty', ondutyRoutes);
app.use('/api/shift', shiftRoutes);
app.use('/api/jasper', jasperRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/gpt', gptRoutes); // Disabled LLM features
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tour', tourRoutes);
app.use('/api/woff', woffRoutes);
app.use('/api/advance', advanceRoutes);
app.use('/api/esileave', esiLeaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/ext-ot', extOtRoutes);
app.use('/api/users', require('./routes/userRoutes'));

// Accounts Module Routes
app.use('/api/accounts/invoices', require('./routes/Accounts/invoiceRoutes'));

// ERP Module Routes
app.use('/api/erp/purchase', require('./routes/ERP/purchaseRoutes'));
app.use('/api/erp/stores', require('./routes/ERP/storesRoutes'));


// Health check
app.get('/', (req, res) => res.send('✅ App is running.'));

app.get('/test-models', (req, res) => {
  const db = require('./models');
  res.json({ 
    loadedModels: Object.keys(db),
    tourModel: db.TourApplication ? '✅ TourApplication loaded' : '❌ TourApplication NOT found',
    woffModel: db.WoffApplication ? '✅ WoffApplication loaded' : '❌ WoffApplication NOT found'
  });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

module.exports = app;
