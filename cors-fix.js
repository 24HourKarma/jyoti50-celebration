// cors-fix.js - Server-side middleware to fix CORS issues for gallery uploads

/**
 * This middleware fixes CORS issues with gallery uploads by ensuring proper headers
 * are set for all responses, especially for multipart/form-data requests.
 * 
 * To use: Import and apply this middleware in your Express server before your routes
 */

function corsFixMiddleware(req, res, next) {
  // Set CORS headers to allow all origins during development
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Special handling for multipart/form-data requests (file uploads)
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    // Log the upload request for debugging
    console.log('Handling multipart/form-data request:', {
      path: req.path,
      method: req.method,
      contentType: req.headers['content-type']
    });
  }
  
  // Continue to the next middleware or route handler
  next();
}

module.exports = corsFixMiddleware;
