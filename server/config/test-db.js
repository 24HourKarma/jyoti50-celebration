// Modified server configuration to use in-memory MongoDB for testing
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // Create an in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(uri);
    
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('MongoDB Disconnected');
  } catch (err) {
    console.error('MongoDB disconnection error:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
