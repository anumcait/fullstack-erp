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
const gptRoutes = require('./routes/gptRoutes');
const dashboardRoutes = require('./routes/HR/dashboardRoutes');
const tourRoutes = require('./routes/HR/tourRoutes');
const woffRoutes = require('./routes/HR/woffRoutes');
const advanceRoutes = require('./routes/HR/advanceRoutes');
const esiLeaveRoutes = require('./routes/HR/esiLeaveRoutes');
const payrollRoutes = require('./routes/HR/payrollRoutes');
const attendanceRoutes = require('./routes/HR/attendanceRoutes');
const holidayRoutes = require('./routes/HR/holidayRoutes');
const extOtRoutes = require('./routes/HR/extOtRoutes');
const settingsRoutes = require('./routes/HR/settingsRoutes');


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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

const pgPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

app.use(session({
  store: new pgSession({
    pool: pgPool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/onduty', ondutyRoutes);
app.use('/api/shift', shiftRoutes);
app.use('/api/jasper', jasperRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/gpt', gptRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tour', tourRoutes);
app.use('/api/woff', woffRoutes);
app.use('/api/advance', advanceRoutes);
app.use('/api/esileave', esiLeaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/ext-ot', extOtRoutes);
app.use('/api/settings', settingsRoutes);
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
