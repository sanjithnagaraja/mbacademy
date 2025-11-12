import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../services/logger.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check if authorization header exists and is in the correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid token format. Expected Bearer <token>' 
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info('Token successfully decoded:', decoded);

    // Find user by ID and check if the user is active
    const user = await User.findById(decoded.userId).populate('assignedCourses');

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or inactive user' 
      });
    }

    req.user = user;
    next();

  } catch (error) {
    logger.error('Authentication error:', error);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token not valid yet' 
      });
    }

    // General catch-all error
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

export const requireCourseAccess = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    
    if (!req.user.hasAccessToCourse(courseId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access to this course denied' 
      });
    }

    next();
  } catch (error) {
    logger.error('Course access check error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error checking course access' 
    });
  }
};