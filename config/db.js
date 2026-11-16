/**
 * ==============================================================================
 * PawGo - Database Configuration & MongoDB Connection (config/db.js)
 * ==============================================================================
 * Handles connection to MongoDB using Mongoose.
 * Supports:
 *   1. Local MongoDB (mongodb://127.0.0.1:27017/pawgo)
 *   2. Cloud MongoDB Atlas (mongodb+srv://...)
 *   3. Non-blocking graceful fallback with connection status reporting
 * ==============================================================================
 */

const mongoose = require('mongoose');

let isConnected = false;
let connectionError = null;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pawgo';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000, // Quick timeout (3s) so server boots rapidly even if MongoDB is offline
      connectTimeoutMS: 3000
    });

    isConnected = true;
    connectionError = null;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    console.warn('⚠️  MongoDB Connection Warning:');
    console.warn(`    Could not connect to MongoDB at "${uri}".`);
    console.warn('    Reason: ' + err.message);
    console.warn('    ℹ️  Notice: Express APIs and local JSON storage remain 100% operational.');
    console.warn('    To connect MongoDB: Start local MongoDB or provide an Atlas URI in your .env file.');
  }

  // Monitor connection events
  mongoose.connection.on('connected', () => {
    isConnected = true;
    connectionError = null;
    console.log('🍃 MongoDB connection established.');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    connectionError = err.message;
    console.error('🍃 MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.log('🍃 MongoDB disconnected.');
  });
}

function getMongoStatus() {
  return {
    connected: isConnected,
    state: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    host: isConnected ? mongoose.connection.host : null,
    dbName: isConnected ? mongoose.connection.name : null,
    uri: process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@') : 'mongodb://127.0.0.1:27017/pawgo',
    error: connectionError
  };
}

module.exports = {
  connectDB,
  getMongoStatus,
  isMongoConnected: () => isConnected
};

