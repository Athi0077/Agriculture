import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error(`Please check your MongoDB Atlas IP Whitelist and connection string.`);
    // process.exit(1); // Do not exit so the server still runs and can return 500 errors
  }
};

export default connectDB;
