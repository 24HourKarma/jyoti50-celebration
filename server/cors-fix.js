// Enhanced CORS middleware for Jyoti50 website
const cors = require('cors');

// Create enhanced CORS middleware with more permissive settings
const enhancedCors = cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all common HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allow common headers
  credentials: true, // Allow cookies to be sent with requests
  maxAge: 86400 // Cache preflight requests for 24 hours
});

module.exports = enhancedCors;
