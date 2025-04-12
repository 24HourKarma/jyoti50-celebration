const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jyoti50secretkey');
    
    // Add user from payload to req object
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
