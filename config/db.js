// Import mongoose - a library that helps Node.js talk to MongoDB
import mongoose from "mongoose";

// Export a function that connects our app to the MongoDB database
// 'async' means this function will wait for the database connection to finish
export const connectDB = async () => {
    try {
        // Use mongoose to connect to MongoDB using the connection string from .env file
        await mongoose.connect(process.env.MONGO_URI);
        // If connection works, print a success message in the terminal
        console.log('MongoDB is connected successfully')
    }
    catch (error) {
        // If connection fails, print the error message
        console.error('MongoDB connection failed: ', error.message);
        // Stop the entire app (exit code 1 means "something went wrong")
        process.exit(1);
    }
}
