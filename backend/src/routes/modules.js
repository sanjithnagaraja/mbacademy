import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import Module from '../models/Module.js';
import Course from '../models/Course.js';
import logger from '../services/logger.js';
import User from '../models/User.js';

const router = express.Router();

// Get modules for a course
router.get('/course/:courseId', authenticateToken, async (req, res, next) => {
  try {
    const { courseId } = req.params;
console.log(req.user.role);

    // Access check using user method
    const hasAccess = await req.user.hasAccessToCourse(courseId);
    if (!(await req.user.hasAccessToCourse(courseId))) {
      console.log(hasAccess);
      
  return res.status(403).json({
    success: false,
    message: 'Access denied to this course'
  });
}


    // Fetch modules for the course
    const modules = await Module.find({ course: courseId })
      .populate('files', 'originalName fileName fileType fileSize description')
      .sort({ order: 1 });

    res.json({
      success: true,
      data: { modules }
    });
  } catch (error) {
    next(error);
  }
});


// Get single module
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id)
      .populate('course', 'title instructor')
      .populate('files', 'originalName fileName fileType fileSize description createdAt')
      .populate('prerequisites', 'title');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check course access
    if (!req.user.hasAccessToCourse(module.course._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this module'
      });
    }

    res.json({
      success: true,
      data: { module }
    });
  } catch (error) {
    next(error);
  }
});

// Create module (Admin or course teacher)
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { courseId, title, description, order, content, duration } = req.body;

    // Check if course exists and user can manage it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!req.user.canManageCourse(courseId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create modules in this course'
      });
    }

    const module = new Module({
      title,
      description,
      course: courseId,
      order,
      content,
      duration
    });

    await module.save();
    await module.populate('course', 'title');

    // Update course module count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { totalModules: 1 }
    });

    logger.info(`Module created: ${title} in course ${course.title} by ${req.user.name}`);

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: { module }
    });
  } catch (error) {
    next(error);
  }
});

// Update module
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id).populate('course');
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    if (!req.user.canManageCourse(module.course._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this module'
      });
    }

    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('course', 'title');

    res.json({
      success: true,
      message: 'Module updated successfully',
      data: { module: updatedModule }
    });
  } catch (error) {
    next(error);
  }
});

// Delete module (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    await Module.findByIdAndDelete(req.params.id);

    // Update course module count
    await Course.findByIdAndUpdate(module.course, {
      $inc: { totalModules: -1 }
    });

    logger.info(`Module deleted: ${module.title} by ${req.user.name}`);

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;