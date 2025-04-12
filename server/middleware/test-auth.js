// Simplified authentication middleware for testing
const jwt = require('jsonwebtoken');

// Simple middleware that doesn't verify token for testing purposes
module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
                req.header('x-auth-token');

  // For testing purposes, we'll allow requests without tokens
  if (!token) {
    req.user = { id: 'test-user-id', role: 'admin' };
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jyoti50secretkey');
    
    // Add user from payload to req object
    req.user = decoded.user;
    next();
  } catch (err) {
    // For testing purposes, we'll allow invalid tokens
    console.error('Auth middleware error:', err.message);
    req.user = { id: 'test-user-id', role: 'admin' };
    next();
  }
};
