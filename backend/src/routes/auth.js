import express from 'express';
import { googleCallback, verifyToken, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Google OAuth callback
router.post('/google', googleCallback);

// Verify token
router.get('/verify', authenticateToken, verifyToken);

// Logout
router.post('/logout', authenticateToken, logout);

export default router;