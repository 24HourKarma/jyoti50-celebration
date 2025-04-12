const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const contactRoutes = require('./routes/contacts');
const reminderRoutes = require('./routes/reminders');
const noteRoutes = require('./routes/notes');
const galleryRoutes = require('./routes/gallery');
const settingRoutes = require('./routes/settings');

// Import error handler
const errorHandler = require('./middleware/error');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingRoutes);

// API error handling middleware
app.use('/api/*', (req, res) => {
  console.log('API endpoint not found:', req.originalUrl);
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
