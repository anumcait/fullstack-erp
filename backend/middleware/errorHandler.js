// backend/middleware/errorHandler.js
// Centralized error handler. Express 5 forwards both synchronous throws and
// rejected async route handlers here, so controllers no longer need a
// try/catch around every call — they can just throw (or let Sequelize errors
// propagate) and this middleware returns a consistent envelope.
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Operational errors thrown via ApiError keep their status/code.
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error('Operational server error', {
        error: err.message,
        code: err.code,
        path: req.originalUrl,
        requestId: req.requestId,
      });
    }
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Sequelize validation / DB errors -> 400/409 with sanitized message.
  if (err && err.name && err.name.startsWith('Sequelize')) {
    const status = err.name === 'SequelizeUniqueConstraintError' ? 409 : 400;
    logger.error('Database error', { error: err.message, path: req.originalUrl });
    return res.status(status).json({
      success: false,
      code: 'DB_ERROR',
      message: status === 409 ? 'Duplicate or conflicting record' : 'Invalid data',
      error: status === 409 ? 'Duplicate or conflicting record' : 'Invalid data',
      ...(process.env.NODE_ENV !== 'production' ? { details: err.message } : {}),
    });
  }

  // Fallback: never leak stack traces to clients in production.
  logger.error('Unhandled error', {
    error: err && err.message,
    stack: err && err.stack,
    path: req.originalUrl,
    requestId: req.requestId,
  });
  const status = err && err.status ? err.status : 500;
  return res.status(status).json({
    success: false,
    code: 'INTERNAL',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err && err.message
        ? err.message
        : 'Internal server error',
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err && err.message
        ? err.message
        : 'Internal server error',
  });
};

module.exports = errorHandler;
