import mongoose from 'mongoose';

const DB_NAME = 'resources_hub';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.RESOURCES_MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI or RESOURCES_MONGODB_URI is required');
    }
    await mongoose.connect(uri, { dbName: DB_NAME });
    console.log(`Resources Hub MongoDB connected (database: ${DB_NAME})`);
  } catch (error) {
    console.error('Resources Hub DB connection error:', error.message);
    process.exit(1);
  }
};

export default connectDB;
