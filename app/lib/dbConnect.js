// For ESM (import syntax)
// import dns from "node:dns/promises";
// dns.setServers(["1.1.1.1", "1.0.0.1"]);   // Cloudflare DNS (fast & reliable)

// OR for CommonJS (require syntax)
const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "8.8.4.4"]);   // Google DNS
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log(' MongoDB Connected!');
    return cached.conn;
  } catch (error) {
    console.error(' MongoDB Connection Error:', error);
    throw error;
  }
}

export default dbConnect;