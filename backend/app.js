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
const logger = require('./utils/logger');

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

const IDLE_TIMEOUT_MS = parseInt(process.env.SESSION_IDLE_TIMEOUT_MS || '', 10) || 30 * 60 * 1000;
const ABSOLUTE_TIMEOUT_MS = parseInt(process.env.SESSION_ABSOLUTE_TIMEOUT_MS || '', 10) || 8 * 60 * 60 * 1000;
let sessionStore;
try {
  const PgStore = require('connect-pg-simple')(session);
  const pgPool = new (require('pg').Pool)({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'hrdb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });
  sessionStore = new PgStore({ pool: pgPool, tableName: 'session', createTableIfMissing: true });
} catch (_) { sessionStore = undefined; }
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: IDLE_TIMEOUT_MS,
    sameSite: 'lax'
  }
}));
app.locals.SESSION_IDLE_TIMEOUT_MS = IDLE_TIMEOUT_MS;
app.locals.SESSION_ABSOLUTE_TIMEOUT_MS = ABSOLUTE_TIMEOUT_MS;

// Trust proxy for rate limiting behind reverse proxy (nginx, Docker, etc.)
app.set('trust proxy', 1);

// Rate limiting
app.use('/api/', apiLimiter); // General API rate limit

// Authentication guard — protect every /api route except public ones.
// Sessions are cookie-based (express-session) and work same-origin; the
// frontend already stores the logged-in user in localStorage for UI gating.
const { requireAuth } = require('./middleware/auth');
// - /auth: login/logout/recovery (always public)
// - /company-settings & /settings/company GET: read-only branding (public)
// - /settings/company POST: first-run company creation (public); the controller
//   enforces login for any subsequent update of an existing company.
const PUBLIC = ['/auth', '/company-settings', '/settings/company'];
app.use('/api', (req, res, next) => {
  if (PUBLIC.some((p) => req.path === p || req.path.startsWith(p + '/'))) return next();
  return requireAuth(req, res, next);
});

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
app.use('/api/oracle', require('./routes/oracleRoutes'));
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

// Multi-DB connectivity status (HR = Postgres, ERP = Postgres, Oracle = legacy)
app.get('/db-status', async (req, res) => {
  const db = require('./models');
  const erpDb = require('./models/ERP');
  const oracleDb = require('./models/Oracle');
  const { getUsage } = require('./services/oracleReplicator');

  const ping = async (label, sequelize) => {
    try {
      await sequelize.authenticate();
      return { label, connected: true };
    } catch (err) {
      return { label, connected: false, error: err.message };
    }
  };

  const [hr, erp, oracleHr, oracleErp, oracleUsage] = await Promise.all([
    ping('HR (Postgres)', db.sequelize),
    ping('ERP (Postgres)', erpDb.sequelize),
    ping('Oracle HR (user hr)', oracleDb.sequelizeHr),
    ping('Oracle ERP (user erp)', oracleDb.sequelizeErp),
    getUsage(),
  ]);

  const allOk = hr.connected && erp.connected && oracleHr.connected && oracleErp.connected;
  res.status(allOk ? 200 : 207).json({
    oracle: (oracleHr.connected && oracleErp.connected) ? '✅ connected' : '❌ disconnected',
    databases: { hr, erp, oracleHr, oracleErp },
    oracleUsage: oracleUsage || { note: 'unavailable' },
  });
});

// 404 for unmatched API routes
app.use('/api', (req, res, next) => {
  const ApiError = require('./utils/ApiError');
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized error handling (must be the last middleware)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Log server boot issues for ops visibility
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', { error: reason && reason.message });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.message, stack: err.stack });
});

module.exports = app;
