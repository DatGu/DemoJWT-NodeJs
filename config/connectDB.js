const mongoose = require('mongoose')

let connectDB = async() => {
    try {
      await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to the database');
    } catch (error) {
      console.error('Failed to connect to the database:', error);
      process.exit(1); // Exit the process with a failure code
    }
  }

  module.exports= connectDB;