// Enhanced error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Server Error:', err.message);
  
  // Log the full error stack in development
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  // Always return JSON for API errors
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
