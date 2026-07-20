// backend/middleware/auth.js
// Centralized authentication & authorization guards.
// - requireAuth: session must exist (any logged-in user)
// - requireRole: user.role must be in the allowed list (ADMIN always passes)
// - requirePermission: user must hold the given permission (ADMIN always passes)

const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ message: 'Unauthorized. Please log in.' });
};

const requireRole = (roles = []) => {
  return (req, res, next) => {
    const user = req.session && req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    if (user.role === 'ADMIN') return next();
    if (roles.includes(user.role)) return next();
    return res.status(403).json({ message: 'Forbidden. Insufficient role.' });
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    const user = req.session && req.session.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    if (user.role === 'ADMIN') return next();
    const perms = Array.isArray(user.permissions) ? user.permissions : [];
    if (perms.includes(permission)) return next();
    return res.status(403).json({ message: 'Forbidden. Missing permission: ' + permission });
  };
};

// Helper to read the current session user (used by controllers).
const currentUser = (req) => (req.session ? req.session.user : null);

module.exports = { requireAuth, requireRole, requirePermission, currentUser };
