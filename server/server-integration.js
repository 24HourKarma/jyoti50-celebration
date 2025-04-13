// server.js integration example - How to integrate the CORS fix middleware

/**
 * This file shows how to integrate the CORS fix middleware into your server.js file
 * Add this code to your existing server.js file to fix the gallery upload issues
 */

// Import required modules
const express = require('express');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');

// Import the CORS fix middleware
const corsFixMiddleware = require('./cors-fix');

// Create Express app
const app = express();

// Apply standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply the CORS fix middleware BEFORE other middleware
app.use(corsFixMiddleware);

// Then apply standard CORS middleware
app.use(cors());

// Configure file upload middleware
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', require('./routes/api'));

// Gallery upload endpoint example
app.post('/api/gallery/upload', (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image uploaded' 
      });
    }
    
    const imageFile = req.files.image;
    const uploadPath = path.join(__dirname, '../public/uploads', imageFile.name);
    
    // Move the file to the uploads directory
    imageFile.mv(uploadPath, (err) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error uploading file' 
        });
      }
      
      // Return success response
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: `/uploads/${imageFile.name}`,
        title: req.body.title || 'Untitled Image',
        description: req.body.description || ''
      });
    });
  } catch (error) {
    console.error('Gallery upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during upload' 
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
