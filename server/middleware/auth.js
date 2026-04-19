const jwt = require('jsonwebtoken');

/**
 * Verifies the JWT in the Authorization header.
 * Attaches the decoded payload to req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, data: null, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, data: null, message: 'Invalid or expired token' });
  }
}

/**
 * Role-based access control middleware factory.
 * Usage: requireRole('admin') or requireRole('agent')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, data: null, message: 'Unauthenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, data: null, message: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
