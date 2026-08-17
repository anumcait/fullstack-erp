const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const client = require('prom-client');
const { apiLimiter, sensitiveActionLimiter } = require('./middleware/rateLimiter');
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
const taxRoutes = require('./routes/HR/taxRoutes');
const attendanceRoutes = require('./routes/HR/attendanceRoutes');
const holidayRoutes = require('./routes/HR/holidayRoutes');
const extOtRoutes = require('./routes/HR/extOtRoutes');
const settingsRoutes = require('./routes/HR/settingsRoutes');
const settingsController = require('./controllers/HR/settingsController');
const recruitmentRoutes = require('./routes/HR/recruitmentRoutes');
const exitSettlementRoutes = require('./routes/HR/exitSettlementRoutes');
const trainingRoutes = require('./routes/HR/trainingRoutes');
const pmsRoutes = require('./routes/HR/pmsRoutes');
const disciplinaryRoutes = require('./routes/HR/disciplinaryRoutes');
const attendanceCollectorRoutes = require('./routes/HR/attendanceCollectorRoutes');
const pfAccountingRoutes = require('./routes/HR/pfAccountingRoutes');

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
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Trust proxy for rate limiting behind reverse proxy (nginx, Docker, etc.)
app.set('trust proxy', 1);

// Rate limiting
app.use('/api/', apiLimiter); // General API rate limit
app.use('/api/auth', authRoutes); // Auth routes have their own stricter limiters
app.use('/api/users', sensitiveActionLimiter, require('./routes/userRoutes')); // User management

// HR Module Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/onduty', ondutyRoutes);
app.use('/api/shift', shiftRoutes);
app.use('/api/jasper', jasperRoutes);
app.use('/api/gpt', gptRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tour', tourRoutes);
app.use('/api/woff', woffRoutes);
app.use('/api/advance', advanceRoutes);
app.use('/api/esileave', esiLeaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/ext-ot', extOtRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/exit', exitSettlementRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/pms', pmsRoutes);
app.use('/api/disciplinary', disciplinaryRoutes);
app.use('/api/attendance-collector', attendanceCollectorRoutes);
app.use('/api/pf', pfAccountingRoutes);
app.use('/api/notifications', require('./routes/HR/notificationRoutes'));

// Accounts Module Routes
app.use('/api/accounts/invoices', require('./routes/Accounts/invoiceRoutes'));
app.use('/api/accounts', require('./routes/Accounts/accountsRoutes'));

// ERP Module Routes
app.use('/api/erp/purchase', require('./routes/ERP/purchaseRoutes'));
app.use('/api/erp/stores', require('./routes/ERP/storesRoutes'));
app.use('/api/erp/engineering', require('./routes/ERP/engineeringRoutes'));
app.use('/api/erp/production', require('./routes/ERP/productionRoutes'));
app.use('/api/erp/marketing', require('./routes/ERP/marketingRoutes'));
app.use('/api/erp/quality', require('./routes/ERP/qualityRoutes'));
app.use('/api/erp/subcontract', require('./routes/ERP/subcontractRoutes'));
app.use('/api/erp/maintenance', require('./routes/ERP/maintenanceRoutes'));
app.use('/api/erp/planning', require('./routes/ERP/planningRoutes'));


// Health check
app.get('/', (req, res) => res.send('✅ App is running.'));

// Health check endpoint (used by deploy.sh and monitoring)
app.get('/api/company-settings', settingsController.getCompanySettings);

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
