import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import logger from '../services/logger.js';

const router = express.Router();

// Get all courses (public)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, level, search } = req.query;
    
    let filter = {};
// if (!req.user || req.user.role !== 'admin') {
//   filter.isPublished = true;
// }
//  filter.isPublished = true;
    
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      data: {
        courses,
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

// Get course by ID
router.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar email')
      .populate('enrolledStudents', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    next(error);
  }
});

// Create course (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.body.instructorId || req.user._id
    };

    const course = new Course(courseData);
    await course.save();
    await course.populate('instructor', 'name avatar');

    logger.info(`Course created: ${course.title} by ${req.user.name}`);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    });
  } catch (error) {
    next(error);
  }
});

// Update course (Admin or assigned teacher)
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'name avatar');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course: updatedCourse }
    });
  } catch (error) {
    next(error);
  }
});

// Delete course (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    logger.info(`Course deleted: ${course.title} by ${req.user.name}`);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;