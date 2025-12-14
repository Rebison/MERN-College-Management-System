import { connect } from "mongoose";

const connectDB = async () => {
  try {
    const DB = await connect(process.env.MONGO_URI);
    
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;