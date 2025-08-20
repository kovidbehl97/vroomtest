// _lib/mongodb.ts
import { MongoClient, ServerApiVersion } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'cars';

if (!MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}



export async function getMongoClient(): Promise<MongoClient> {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (globalWithMongo._mongoClientPromise) {
    console.log('Using cached MongoDB client promise');
    try {
      const client = await globalWithMongo._mongoClientPromise;
      console.log('Cached MongoDB client is valid');
      return client;
    } catch (error) {
      console.error('Cached MongoDB client error:', error);
      // Invalidate cache on error and retry
     
    }
  }

  console.log('Creating new MongoDB client connection promise');
  const client = new MongoClient(MONGODB_URI!, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    globalWithMongo._mongoClientPromise = client.connect();
    const connectedClient = await globalWithMongo._mongoClientPromise;
    console.log('MongoDB client connected successfully');
    return connectedClient;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function getMongoDb() {
  try {
    const client = await getMongoClient();
    console.log('Accessing database:', dbName);
    return client.db(dbName);
  } catch (error) {
    console.error('Error accessing database:', error);
    throw error;
  }
}