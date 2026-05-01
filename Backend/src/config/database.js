import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/perplexity';

        const conn = await mongoose.connect(mongoURI);

        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        throw error;
    }
};

export default connectDB;
