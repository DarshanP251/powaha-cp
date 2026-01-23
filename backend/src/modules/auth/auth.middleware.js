const jwt = require('jsonwebtoken');

module.exports = (roles = []) => (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });

    const LOGIN_SECRET = process.env.LOGIN_SECRET || 'powaha_super_secret_key_2026';
    const decoded = jwt.verify(token, LOGIN_SECRET);

    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
