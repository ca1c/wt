import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error('Please define MONGODB_URI in .env.local');

let cachedClient: MongoClient | null = null;

export async function dbConnect() {
    if (cachedClient) return cachedClient;

    const client = new MongoClient(uri);
    await client.connect();

    cachedClient = client;
    return client;
}