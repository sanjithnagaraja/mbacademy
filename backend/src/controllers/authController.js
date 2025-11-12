import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../services/logger.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const googleCallback = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    // Check if user exists
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      // Create new user
      user = new User({
        googleId,
        email,
        name,
        avatar: picture || '',
        role: 'student' // Default role
      });
      await user.save();
      logger.info(`New user created: ${email}`);
    } else {
      // Update existing user
      user.googleId = googleId;
      user.avatar = picture || user.avatar;
      user.lastLogin = new Date();
      await user.save();
      logger.info(`User logged in: ${email}`);
    }

    const token = generateToken(user._id);
console.log("authController: Token: ",token);

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          assignedCourses: user.assignedCourses
        }
      }
    });
  } catch (error) {
    logger.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('assignedCourses', 'title thumbnail')
      .select('-__v');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          assignedCourses: user.assignedCourses,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

export const logout = async (req, res) => {
  try {
    // In a more sophisticated setup, you might maintain a blacklist of tokens
    // For now, we'll just send a success response
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};