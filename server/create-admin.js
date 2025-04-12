// Create a default admin user for testing
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    try {
      // Check if admin user already exists
      const existingUser = await User.findOne({ username: 'admin' });
      
      if (existingUser) {
        console.log('Admin user already exists');
      } else {
        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('jyoti50admin', salt);
        
        const newUser = new User({
          username: 'admin',
          email: 'admin@jyoti50.com',
          password: hashedPassword,
          role: 'admin'
        });
        
        await newUser.save();
        console.log('Admin user created successfully');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
    }
    
    // Disconnect from MongoDB
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
  });
