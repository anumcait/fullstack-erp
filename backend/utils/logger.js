// backend/utils/logger.js
// Lightweight structured logger. Replaces ad-hoc console.error/console.log in
// controllers with a single consistent sink that is safe for production
// (JSON lines) and easy to pipe into log aggregation (ELK, Datadog, etc.).
const isProd = process.env.NODE_ENV === 'production';

function emit(level, message, meta = {}) {
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...meta,
  };
  if (isProd) {
    process.stdout.write(JSON.stringify(entry) + '\n');
  } else {
    // Human-readable in dev; errors still go to stderr.
    const prefix = `[${entry.time}] ${level.toUpperCase()}`;
    if (level === 'error') console.error(prefix, message, meta.error || '', meta);
    else console.log(prefix, message, Object.keys(meta).length ? meta : '');
  }
}

module.exports = {
  info: (msg, meta) => emit('info', msg, meta),
  warn: (msg, meta) => emit('warn', msg, meta),
  error: (msg, meta) => emit('error', msg, meta),
  debug: (msg, meta) => (isProd ? null : emit('debug', msg, meta)),
};
