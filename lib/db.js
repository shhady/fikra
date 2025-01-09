import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable')
}

let cachedClient = null
let cachedDb = null

export async function connectDB() {
  if (cachedDb) {
    return cachedDb
  }

  if (!cachedClient) {
    cachedClient = await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  }

  cachedDb = cachedClient.db(MONGODB_DB)
  return cachedDb
} 