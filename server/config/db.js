const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB with URI:', process.env.MONGODB_URI ? 'URI exists' : 'URI is missing');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected:', mongoose.connection.host);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
