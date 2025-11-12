import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import logger from '../services/logger.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const filter = {};
    
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .populate('assignedCourses', 'title thumbnail')
      .select('-googleId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('assignedCourses', 'title thumbnail description instructor')
      .select('-googleId');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Update user role and course assignments (Admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const { role, assignedCourses } = req.body;
    const userId = req.params.id;

    // Validate role
    if (role && !['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Validate courses exist
    if (assignedCourses && assignedCourses.length > 0) {
      const courseCount = await Course.countDocuments({
        _id: { $in: assignedCourses }
      });
      
      if (courseCount !== assignedCourses.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more courses not found'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...(role && { role }),
        ...(assignedCourses && { assignedCourses })
      },
      { new: true, runValidators: true }
    ).populate('assignedCourses', 'title thumbnail');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update course enrollments if courses were assigned
    if (assignedCourses) {
      // Remove user from all courses first
      await Course.updateMany(
        { enrolledStudents: userId },
        { $pull: { enrolledStudents: userId } }
      );

      // Add user to assigned courses
      await Course.updateMany(
        { _id: { $in: assignedCourses } },
        { $addToSet: { enrolledStudents: userId } }
      );
    }

    logger.info(`User updated: ${updatedUser.email} by ${req.user.name}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
});

// Deactivate user (Admin only)
router.put('/:id/deactivate', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`User deactivated: ${user.email} by ${req.user.name}`);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get user statistics (Admin only)
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$isActive', true] }, 1, 0]
            }
          }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        roleBreakdown: stats
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;