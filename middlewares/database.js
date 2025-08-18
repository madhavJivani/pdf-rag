import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB already connected");
      return;
    }
    
    // Check if currently connecting
    if (mongoose.connection.readyState === 2) {
      console.log("MongoDB connection in progress");
      return;
    }
    
    await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DATABASE_NAME}`);
    console.log("MongoDB connected successfully");
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error("MongoDB connection error:", error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log("MongoDB disconnected");
    });
    
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
