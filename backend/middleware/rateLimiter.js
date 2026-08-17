const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message, keyGenerator) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    // Use express-rate-limit's built-in IPv6-safe key generator so that requests
    // behind a proxy (trust proxy enabled) don't trip the ERR_ERL_KEY_GEN_IPV6
    // validation. Falls back to 'anonymous' when no IP can be derived.
    keyGenerator: keyGenerator || ((req, res) => ipKeyGenerator(req, res) ?? req.ip ?? 'anonymous'),
    handler: (req, res) => {
      res.status(429).json({ success: false, message });
    },
  });
};

const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many login attempts, please try again after 15 minutes'
);

const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 attempts per hour
  'Too many password reset requests, please try again after 1 hour'
);

const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests, please try again later'
);

const sensitiveActionLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 sensitive actions per hour
  'Too many requests for this action, please try again after 1 hour'
);

const fileUploadLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  20, // 20 uploads per window
  'Too many file uploads, please try again later'
);

module.exports = {
  authLimiter,
  passwordResetLimiter,
  apiLimiter,
  sensitiveActionLimiter,
  fileUploadLimiter,
  createRateLimiter,
};