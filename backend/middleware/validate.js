// backend/middleware/validate.js
// Minimal, dependency-free request validator. Define a schema and the
// middleware throws ApiError(400) with per-field details when invalid.
//   body:  { field: { type, required, min, max, enum, items } }
//   query/params: same shape, optional (defaults to body only).
const ApiError = require('../utils/ApiError');

const TYPES = ['string', 'number', 'integer', 'boolean', 'array', 'object', 'email', 'date'];

function isEmpty(v) {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}

function checkField(value, rules, path) {
  const errors = [];
  if (isEmpty(value)) {
    if (rules.required) errors.push(`${path} is required`);
    return errors; // optional + empty -> skip remaining checks
  }
  if (rules.type) {
    if (rules.type === 'string' && typeof value !== 'string') errors.push(`${path} must be a string`);
    if (rules.type === 'number' && typeof value !== 'number' && isNaN(Number(value)))
      errors.push(`${path} must be a number`);
    if (rules.type === 'integer' && !Number.isInteger(Number(value)))
      errors.push(`${path} must be an integer`);
    if (rules.type === 'boolean' && typeof value !== 'boolean')
      errors.push(`${path} must be a boolean`);
    if (rules.type === 'array' && !Array.isArray(value)) errors.push(`${path} must be an array`);
    if (rules.type === 'object' && (typeof value !== 'object' || Array.isArray(value)))
      errors.push(`${path} must be an object`);
    if (rules.type === 'email' && typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      errors.push(`${path} must be a valid email`);
    if (rules.type === 'date') {
      const d = Date.parse(value);
      if (isNaN(d)) errors.push(`${path} must be a valid date`);
    }
  }
  if (typeof value === 'string') {
    if (rules.min != null && value.length < rules.min) errors.push(`${path} must be at least ${rules.min} chars`);
    if (rules.max != null && value.length > rules.max) errors.push(`${path} must be at most ${rules.max} chars`);
  }
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const n = Number(value);
    if (rules.min != null && n < rules.min) errors.push(`${path} must be >= ${rules.min}`);
    if (rules.max != null && n > rules.max) errors.push(`${path} must be <= ${rules.max}`);
  }
  if (rules.enum && !rules.enum.includes(value)) errors.push(`${path} must be one of: ${rules.enum.join(', ')}`);
  if (rules.type === 'array' && Array.isArray(value) && rules.items) {
    value.forEach((item, i) => {
      if (rules.items.type === 'object' && rules.items.shape) {
        Object.entries(rules.items.shape).forEach(([k, r]) => {
          errors.push(...checkField(item[k], r, `${path}[${i}].${k}`));
        });
      }
    });
  }
  return errors;
}

function buildValidator(targets) {
  return (req, res, next) => {
    const allErrors = [];
    for (const [loc, schema] of Object.entries(targets)) {
      const source = loc === 'query' ? req.query : loc === 'params' ? req.params : req.body;
      for (const [field, rules] of Object.entries(schema)) {
        allErrors.push(...checkField(source ? source[field] : undefined, rules, `${loc}.${field}`));
      }
    }
    if (allErrors.length) {
      throw ApiError.badRequest('Validation failed', allErrors);
    }
    next();
  };
}

module.exports = buildValidator;
module.exports.TYPES = TYPES;
