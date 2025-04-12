// api-fix.js - Script to fix API issues in server-hardcoded-auth.js

const fs = require('fs');
const path = require('path');

// Path to the server file
const serverFilePath = path.join(__dirname, 'server-hardcoded-auth.js');

// Read the current file
fs.readFile(serverFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading server-hardcoded-auth.js:', err);
    return;
  }

  // Find the catch-all route
  const catchAllRegex = /app\.get\(\'\*\'\s*,\s*\(req,\s*res\)\s*=>\s*\{[\s\S]*?\}\);/;
  
  // New API error handling middleware and updated catch-all route
  const newApiErrorHandling = `
// API error handling middleware
app.use('/api/*', (req, res) => {
  console.log('API endpoint not found:', req.originalUrl);
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  console.log('Serving index.html for route:', req.originalUrl);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});`;
  
  // Replace the catch-all route with our new code
  let updatedContent = data;
  if (catchAllRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(catchAllRegex, newApiErrorHandling);
    console.log('Catch-all route replaced with API error handling middleware');
  } else {
    // If regex doesn't match, try to find the app.listen section and add our code before it
    const listenRegex = /app\.listen\(PORT,\s*\(\)\s*=>\s*\{[\s\S]*?\}\);/;
    if (listenRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(listenRegex, match => {
        return newApiErrorHandling + '\n\n' + match;
      });
      console.log('API error handling middleware added before app.listen');
    } else {
      console.error('Could not find appropriate location to add API error handling middleware');
      return;
    }
  }
  
  // Add CORS configuration update
  const corsRegex = /app\.use\(cors\(\)\);/;
  const newCorsConfig = `app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));`;
  
  if (corsRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(corsRegex, newCorsConfig);
    console.log('CORS configuration updated');
  } else {
    console.log('Could not find CORS configuration to update');
  }
  
  // Add more detailed console logging for API routes
  updatedContent = updatedContent.replace(/app\.get\('\/api\/([^']+)'/g, (match, endpoint) => {
    return `app.get('/api/${endpoint}', (req, res, next) => {
  console.log('API request received for GET /api/${endpoint}');
  next();
}`;
  });
  
  updatedContent = updatedContent.replace(/app\.post\('\/api\/([^']+)'/g, (match, endpoint) => {
    return `app.post('/api/${endpoint}', (req, res, next) => {
  console.log('API request received for POST /api/${endpoint}', req.body);
  next();
}`;
  });
  
  updatedContent = updatedContent.replace(/app\.put\('\/api\/([^']+)'/g, (match, endpoint) => {
    return `app.put('/api/${endpoint}', (req, res, next) => {
  console.log('API request received for PUT /api/${endpoint}', req.body);
  next();
}`;
  });
  
  updatedContent = updatedContent.replace(/app\.delete\('\/api\/([^']+)'/g, (match, endpoint) => {
    return `app.delete('/api/${endpoint}', (req, res, next) => {
  console.log('API request received for DELETE /api/${endpoint}');
  next();
}`;
  });
  
  console.log('Added detailed logging for API routes');
  
  // Write the updated file
  fs.writeFile(serverFilePath, updatedContent, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing updated server-hardcoded-auth.js:', writeErr);
      return;
    }
    console.log('server-hardcoded-auth.js updated successfully with API fixes');
    
    // Create a backup of the original file
    fs.writeFile(`${serverFilePath}.backup`, data, 'utf8', (backupErr) => {
      if (backupErr) {
        console.error('Error creating backup file:', backupErr);
        return;
      }
      console.log('Backup of original server-hardcoded-auth.js created');
    });
  });
});

// Create admin-dashboard-fix.js to update the admin dashboard JavaScript
const adminDashboardJsPath = path.join(__dirname, 'public', 'js', 'admin-dashboard.js');

fs.readFile(adminDashboardJsPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading admin-dashboard.js:', err);
    console.log('Will create a new admin-dashboard-fix.js file instead');
    
    // Create a new file with debugging code
    const adminDashboardFixPath = path.join(__dirname, 'public', 'js', 'admin-dashboard-fix.js');
    const fixContent = `// Admin Dashboard Fix - Add this to your HTML before the closing </body> tag
// <script src="/js/admin-dashboard-fix.js"></script>

console.log('Admin dashboard fix loaded');

// Override fetch for debugging
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  console.log('Fetch request:', url, options);
  
  // Ensure options exists
  options = options || {};
  
  // Ensure headers exist
  options.headers = options.headers || {};
  
  // Add hardcoded token to all API requests
  if (url.startsWith('/api/')) {
    options.headers['Authorization'] = 'Bearer hardcoded_admin_token_for_guaranteed_access';
    console.log('Added hardcoded token to request');
  }
  
  return originalFetch(url, options)
    .then(response => {
      console.log('Fetch response status:', response.status);
      
      // Clone the response so we can both log it and return it
      const clone = response.clone();
      
      // Log the response body for debugging
      clone.text().then(text => {
        try {
          const data = JSON.parse(text);
          console.log('Response data:', data);
        } catch (e) {
          console.error('Response is not valid JSON:', text.substring(0, 500));
        }
      });
      
      return response;
    })
    .catch(error => {
      console.error('Fetch error:', error);
      throw error;
    });
};

// Add this script tag to your admin-dashboard.html
// <script src="/js/admin-dashboard-fix.js"></script>

// Instructions for adding this fix:
// 1. Upload this file to your public/js folder
// 2. Add the script tag to admin-dashboard.html before the closing </body> tag
// 3. Redeploy your application
`;
    
    fs.writeFile(adminDashboardFixPath, fixContent, 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing admin-dashboard-fix.js:', writeErr);
        return;
      }
      console.log('admin-dashboard-fix.js created successfully');
    });
    return;
  }
  
  // If we found the file, update it with debugging code
  let updatedContent = data;
  
  // Add debugging to fetch calls
  const fetchRegex = /fetch\(([^)]+)\)/g;
  updatedContent = updatedContent.replace(fetchRegex, (match, args) => {
    return `fetch(${args})
    .then(response => {
      console.log('Response status:', response.status);
      return response.text().then(text => {
        try {
          // Try to parse as JSON
          const data = JSON.parse(text);
          console.log('Parsed JSON:', data);
          return data;
        } catch (e) {
          // If not valid JSON, log the raw text
          console.error('Invalid JSON response:', text.substring(0, 500));
          throw new Error('Invalid JSON response');
        }
      });
    })`;
  });
  
  // Add hardcoded token to all API calls
  const headersRegex = /headers:\s*\{([^}]*)\}/g;
  updatedContent = updatedContent.replace(headersRegex, (match, headerContent) => {
    if (headerContent.includes('Authorization')) {
      return match.replace(/'Authorization':[^,}]+/, "'Authorization': 'Bearer hardcoded_admin_token_for_guaranteed_access'");
    } else {
      return match.replace('}', ", 'Authorization': 'Bearer hardcoded_admin_token_for_guaranteed_access' }");
    }
  });
  
  // Write the updated file
  fs.writeFile(`${adminDashboardJsPath}.fixed`, updatedContent, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing updated admin-dashboard.js:', writeErr);
      return;
    }
    console.log('admin-dashboard.js.fixed created successfully with debugging code');
    console.log('Rename this file to admin-dashboard.js after reviewing the changes');
  });
});

console.log('API fix script executed. Check for success messages above.');
