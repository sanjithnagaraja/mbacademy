import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import serverless from 'serverless-http';

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
const handler = serverless(app);

export default async (req, res) => {
  await connectDB();
  return handler(req, res);
};
