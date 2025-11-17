import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import courseRoutes from './src/routes/courses.js';
import moduleRoutes from './src/routes/modules.js';
import fileRoutes from './src/routes/files.js';
import contactRoutes from './src/routes/contact.js';
import healthRoutes from './src/routes/health.js';

// Import middleware
import { errorHandler } from './src/middleware/errorHandler.js';
import logger from './src/services/logger.js';

// Load environment variables
dotenv.config();

const app = express();
export { app };

// ===== Middleware =====
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// ===== Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/health', healthRoutes);

// ===== Error handling =====
app.use(errorHandler);

// ===== MongoDB Connection (Singleton for Serverless) =====
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
  }
}

// ===== Serverless handler =====
// For Vercel's `@vercel/node` runtime we can export a function that
// ensures DB connection and then forwards the request to the Express app.
// Avoid using `serverless-http` here to prevent double-wrapping issues.
export default async (req, res) => {
  await connectDB();
  return app(req, res);
};

// If running locally for development/testing, start a listener so we can
// run a quick smoke test (`LOCAL_DEV=true node server.js`).
if (process.env.LOCAL_DEV === 'true') {
  (async () => {
    await connectDB();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logger.info(`Local dev server listening on port ${port}`);
    });
  })();
}
