import express from 'express';
import mongoose from 'mongoose';
import S3Service from '../services/s3Service.js';
import logger from '../services/logger.js';

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: 'OK',
    services: {
      database: 'unknown',
      s3: 'unknown'
    }
  };

  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState === 1) {
      healthCheck.services.database = 'connected';
    } else {
      healthCheck.services.database = 'disconnected';
      healthCheck.status = 'ERROR';
    }

    // Check S3 connection
    try {
      const s3Status = await S3Service.checkBucketAccess();
      healthCheck.services.s3 = s3Status ? 'accessible' : 'inaccessible';
      
      if (!s3Status) {
        healthCheck.status = 'WARNING';
      }
    } catch (s3Error) {
      healthCheck.services.s3 = 'error';
      healthCheck.status = 'ERROR';
      logger.error('S3 health check failed:', s3Error);
    }

  } catch (error) {
    healthCheck.status = 'ERROR';
    healthCheck.error = error.message;
    logger.error('Health check error:', error);
  }

  const statusCode = healthCheck.status === 'OK' ? 200 : 503;
  res.status(statusCode).json({
    success: healthCheck.status === 'OK',
    data: healthCheck
  });
});

// Database-specific health check
router.get('/db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    // Try a simple database operation
    const collections = await mongoose.connection.db.listCollections().toArray();

    res.json({
      success: true,
      data: {
        state: states[dbState],
        collections: collections.length,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      }
    });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Database health check failed',
      error: error.message
    });
  }
});

export default router;