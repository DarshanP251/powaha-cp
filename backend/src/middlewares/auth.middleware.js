const jwt = require('jsonwebtoken');

module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      // 1️⃣ Authorization header check
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          message: 'Authorization token missing'
        });
      }

      // 2️⃣ Extract token
      const token = authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          message: 'Token missing'
        });
      }

      // 3️⃣ Verify token
      const LOGIN_SECRET = process.env.LOGIN_SECRET || 'powaha_super_secret_key_2026';
      const decoded = jwt.verify(token, LOGIN_SECRET);

      // 4️⃣ Attach decoded payload to request
      req.user = {
        user_id: decoded.user_id,
        role: decoded.role,
        cp_id: decoded.cp_id || null
      };

      // 5️⃣ Role-based access control
      if (
        Array.isArray(allowedRoles) &&
        allowedRoles.length > 0 &&
        !allowedRoles.includes(req.user.role)
      ) {
        return res.status(403).json({
          message: 'Forbidden: insufficient permissions'
        });
      }

      // 6️⃣ All good → proceed
      next();

    } catch (error) {
      console.error('AUTH ERROR:', error.message);

      return res.status(401).json({
        message: 'Invalid or expired token'
      });
    }
  };
};

console.log('VERIFY SECRET:', process.env.JWT_SECRET);

