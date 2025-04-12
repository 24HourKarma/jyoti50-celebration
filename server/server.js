const fs = require('fs');
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Initialize Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Explicitly serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ msg: 'API is working' });
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/debug', require('./debug-api'));

// Serve index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Define PORT
const PORT = process.env.PORT || 3000;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Server Error', error: err.message });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
