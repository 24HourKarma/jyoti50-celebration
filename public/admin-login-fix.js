// admin-login-fix.js - Script to fix admin login issues
// This script modifies the admin-login.html file to ensure it works with the hardcoded authentication

const fs = require('fs');
const path = require('path');

// Path to the admin login HTML file
const adminLoginPath = path.join(__dirname, 'public', 'admin-login.html');

// Read the current file
fs.readFile(adminLoginPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading admin-login.html:', err);
    return;
  }

  // Find and replace the login form JavaScript
  let updatedContent = data;
  
  // Look for the login form submission code
  const loginFormRegex = /document\.getElementById\(['"]loginForm['"]\)\.addEventListener\(['"]submit['"]\s*,\s*function\s*\(e\)\s*\{[\s\S]*?\}\);/;
  
  // New login form code with improved error handling and support for both username and email
  const newLoginFormCode = `document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Clear previous error messages
    document.getElementById('loginError').textContent = '';
    
    console.log('Attempting login with:', { email, password: '***' });
    
    // Send login request
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        username: email, // Try both as username and email
        password: password
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Login failed');
      }
      return response.json();
    })
    .then(data => {
      console.log('Login successful:', data);
      
      // Store token in localStorage
      localStorage.setItem('jyoti50_token', data.token);
      localStorage.setItem('jyoti50_user', JSON.stringify(data.user));
      
      // Redirect to admin dashboard
      window.location.href = '/admin-dashboard.html';
    })
    .catch(error => {
      console.error('Login error:', error);
      document.getElementById('loginError').textContent = 'Invalid email or password. Please try again.';
      
      // Try alternative login approach
      console.log('Trying alternative login approach...');
      
      fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: email,
          password: password
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Alternative login failed');
        }
        return response.json();
      })
      .then(data => {
        console.log('Alternative login successful:', data);
        
        // Store token in localStorage
        localStorage.setItem('jyoti50_token', data.token);
        localStorage.setItem('jyoti50_user', JSON.stringify(data.user));
        
        // Redirect to admin dashboard
        window.location.href = '/admin-dashboard.html';
      })
      .catch(altError => {
        console.error('Alternative login error:', altError);
        // Error message already displayed from first attempt
      });
    });
  });`;
  
  // Replace the login form code
  if (loginFormRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(loginFormRegex, newLoginFormCode);
    console.log('Login form code replaced successfully');
  } else {
    // If regex doesn't match, try to find the script section and append our code
    const scriptRegex = /<script>[\s\S]*?<\/script>/;
    if (scriptRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(scriptRegex, match => {
        return match.replace('</script>', `\n${newLoginFormCode}\n</script>`);
      });
      console.log('Login form code appended to script section');
    } else {
      // If no script section found, add one before the closing body tag
      updatedContent = updatedContent.replace('</body>', `<script>\n${newLoginFormCode}\n</script>\n</body>`);
      console.log('New script section added with login form code');
    }
  }
  
  // Add debug console output
  updatedContent = updatedContent.replace('</head>', `
  <script>
    // Debug logging
    console.log('Admin login page loaded');
    window.addEventListener('DOMContentLoaded', function() {
      console.log('DOM fully loaded');
      console.log('Login form elements:', {
        form: document.getElementById('loginForm'),
        emailField: document.getElementById('email'),
        passwordField: document.getElementById('password'),
        errorElement: document.getElementById('loginError')
      });
    });
  </script>
  </head>`);
  
  // Write the updated file
  fs.writeFile(adminLoginPath, updatedContent, 'utf8', (writeErr) => {
    if (writeErr) {
      console.error('Error writing updated admin-login.html:', writeErr);
      return;
    }
    console.log('admin-login.html updated successfully');
    
    // Create a backup of the original file
    fs.writeFile(`${adminLoginPath}.backup`, data, 'utf8', (backupErr) => {
      if (backupErr) {
        console.error('Error creating backup file:', backupErr);
        return;
      }
      console.log('Backup of original admin-login.html created');
    });
  });
});

console.log('Admin login fix script executed. Check for success messages above.');
