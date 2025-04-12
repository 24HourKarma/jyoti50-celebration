// server/debug-api.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Test route that returns connection status and database info
router.get('/', async (req, res) => {
  try {
    const dbStatus = {
      isConnected: mongoose.connection.readyState === 1,
      dbName: mongoose.connection.name,
      collections: await mongoose.connection.db.listCollections().toArray(),
      connectionDetails: {
        host: mongoose.connection.host,
        port: mongoose.connection.port
      }
    };
    
    res.json({
      message: 'Debug API is working',
      mongoStatus: dbStatus,
      env: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        mongoUriExists: !!process.env.MONGODB_URI,
        // Don't include the actual URI for security reasons
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error in debug route',
      error: error.message
    });
  }
});

// Test route to check if data exists in collections
router.get('/collections', async (req, res) => {
  try {
    const collections = mongoose.connection.collections;
    const counts = {};
    
    for (const [name, collection] of Object.entries(collections)) {
      counts[name] = await collection.countDocuments();
    }
    
    res.json({
      message: 'Collection counts',
      counts
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error checking collections',
      error: error.message
    });
  }
});

module.exports = router;
