const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MONGODB_URI instead of MONGO_URI
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected:', mongoose.connection.host);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
