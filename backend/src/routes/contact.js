import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import logger from '../services/logger.js';

const router = express.Router();

// Rate limiting for contact form (5 submissions per 15 minutes)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many contact submissions. Please try again later.'
  }
});

// Validation rules
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

// Submit contact form
router.post('/', contactLimiter, contactValidation, async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // Log the contact submission
    logger.info('Contact form submission', {
      name,
      email,
      subject,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // In a real application, you might:
    // 1. Send an email to administrators
    // 2. Save to database for tracking
    // 3. Send auto-reply to user
    
    // For now, we'll just log and return success
    // The frontend will handle EmailJS integration

    res.json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!'
    });

  } catch (error) {
    next(error);
  }
});

export default router;