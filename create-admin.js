const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create a test admin user for API testing
async function createAdminUser() {
  let mongod;
  try {
    // Start MongoDB Memory Server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    // Connect to in-memory MongoDB
    await mongoose.connect(uri);
    console.log('MongoDB Connected:', mongoose.connection.host);

    // Import User model
    const User = require('./server/models/user');

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
    
    // Generate token for testing
    const payload = {
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'jyoti50secretkey',
      { expiresIn: '24h' }
    );
    
    console.log('Test token:', token);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
    
    // Stop MongoDB Memory Server
    await mongod.stop();
  } catch (error) {
    console.error('Error creating admin user:', error);
    if (mongod) await mongod.stop();
    process.exit(1);
  }
}

// Run the function
createAdminUser();
