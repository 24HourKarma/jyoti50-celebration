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

  // Add CORS configuration update
  const corsRegex = /app\.use\(cors\(\)\);/;
  const newCorsConfig = `app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));`;
  
  let updatedContent = data;
  if (corsRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(corsRegex, newCorsConfig);
    console.log('CORS configuration updated');
  } else {
    console.log('Could not find CORS configuration to update');
  }
  
  // Add API error handling before the catch-all route
  const catchAllRegex = /app\.get\(\'\*\'\s*,\s*\(req,\s*res\)\s*=>\s*\{/;
  const apiErrorHandling = `// API error handling middleware
app.use('/api/*', (req, res) => {
  console.log('API endpoint not found:', req.originalUrl);
  res.status(404).json({ error: 'API endpoint not found' });
});

app.get('*', (req, res) => {`;
  
  if (catchAllRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(catchAllRegex, apiErrorHandling);
    console.log('API error handling middleware added');
  } else {
    console.log('Could not find catch-all route to update');
  }
  
  // Write the updated file
  fs.writeFile(serverFilePath, updatedContent, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing updated server-hardcoded-auth.js:', writeErr);
      return;
    }
    console.log('server-hardcoded-auth.js updated successfully with API fixes');
  });
});

console.log('API fix script executed. Server fixes applied.');
