require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');
const metricRoutes = require('./routes/metricRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(cors());
// 1mb so a resized profile photo (base64) fits in the request body
app.use(express.json({ limit: '1mb' }));

// These two work without a database so you can quickly check the deployment.
app.get('/', (req, res) =>
  res.json({ status: 'success', message: 'VitaCare Node.js Express Backend is Live on Vercel!' })
);
app.get('/api/ping', (req, res) => res.json({ status: 'ok', app: 'VitaCare API' }));

// Everything below needs the database and a JWT secret.
app.use(async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      if (process.env.NODE_ENV === 'production') {
        console.error('JWT_SECRET is not set (add it in Vercel > Settings > Environment Variables)');
        return res.status(500).json({ code: 'SERVER_ERROR', message: 'Server is not configured' });
      }
      process.env.JWT_SECRET = 'dev-only-secret-change-me';
      console.warn('JWT_SECRET is not set - using an insecure development secret.');
    }
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Database connection failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ code: 'NOT_FOUND', message: 'Route not found' }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'CastError' || err.name === 'ValidationError') {
    return res.status(400).json({ code: 'INVALID_INPUT', message: 'Invalid data' });
  }
  res.status(500).json({ code: 'SERVER_ERROR', message: 'Something went wrong' });
});

// Vercel imports the app; only listen when running locally (npm run dev).
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log('VitaCare API running on http://localhost:' + PORT));
}

module.exports = app;
