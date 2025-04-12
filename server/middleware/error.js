// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Check if error is a Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  
  // Check if error is a Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value entered' });
  }
  
  // Check if error is a JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  // Check if error is a JWT expired error
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  
  // Default server error
  res.status(500).json({
    message: err.message || 'Server Error'
  });
};

module.exports = errorHandler;
