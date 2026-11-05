const mongoose = require('mongoose');

// Serverless functions are re-used between requests, so the connection is cached
// on `global` and only opened when it is not already open.
const cache = global._vitacareMongo || (global._vitacareMongo = { promise: null });

/**
 * Connects to MongoDB (use a free MongoDB Atlas cluster and put its URL in MONGO_URI).
 * Local development without MONGO_URI falls back to an in-memory MongoDB if that
 * optional package is installed.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  if (!cache.promise) {
    let uri = process.env.MONGO_URI;

    if (!uri) {
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        throw new Error('MONGO_URI is not set (add it in Vercel > Settings > Environment Variables)');
      }
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
      console.log('No MONGO_URI set - using in-memory MongoDB (data resets on restart).');
    }

    cache.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 8000 })
      .then((conn) => {
        console.log('MongoDB connected: ' + conn.connection.host);
      })
      .catch((err) => {
        cache.promise = null; // allow a retry on the next request
        throw err;
      });
  }

  await cache.promise;
};

module.exports = connectDB;
