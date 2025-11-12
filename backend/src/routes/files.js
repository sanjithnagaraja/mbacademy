import express from 'express';
import multer from 'multer';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import File from '../models/File.js';
import Module from '../models/Module.js';
import S3Service from '../services/s3Service.js';
import logger from '../services/logger.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/avi'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Upload file to module
router.post('/upload', authenticateToken, upload.single('file'), async (req, res, next) => {
  try {
    const { moduleId, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // Check module exists and user can upload to it
    const module = await Module.findById(moduleId).populate('course');
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    if (!req.user.canManageCourse(module.course._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload files to this module'
      });
    }

    // Generate unique filename
    const fileName = S3Service.generateFileName(req.file.originalname, req.user._id);
    
    // Upload to S3
    await S3Service.uploadFile(req.file.buffer, fileName, req.file.mimetype);

    // Save file record to database
    const file = new File({
      originalName: req.file.originalname,
      fileName: fileName,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      s3Key: fileName,
      s3Bucket: process.env.S3_BUCKET_NAME,
      module: moduleId,
      uploadedBy: req.user._id,
      description: description || ''
    });

    await file.save();

    // Add file to module
    await Module.findByIdAndUpdate(moduleId, {
      $push: { files: file._id }
    });

    await file.populate('uploadedBy', 'name email');

    logger.info(`File uploaded: ${req.file.originalname} to module ${module.title} by ${req.user.name}`);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: { file }
    });
  } catch (error) {
    next(error);
  }
});

// Get signed URL for file download/preview
router.get('/:id/url', authenticateToken, async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id)
      .populate({
        path: 'module',
        populate: {
          path: 'course',
          select: 'title instructor enrolledStudents'
        }
      });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check access permissions
    const courseId = file.module.course._id;
    if (!req.user.hasAccessToCourse(courseId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this file'
      });
    }

    // Generate signed URL
    const signedUrl = await S3Service.getSignedUrl(file.s3Key, 3600); // 1 hour expiry

    // Increment download count
    await file.incrementDownloadCount();

    res.json({
      success: true,
      data: {
        url: signedUrl,
        fileName: file.originalName,
        fileType: file.fileType,
        fileSize: file.fileSize
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get files in a module
router.get('/module/:moduleId', authenticateToken, async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId).populate('course');
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    if (!req.user.hasAccessToCourse(module.course._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this module'
      });
    }

    const files = await File.find({ module: moduleId })
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { files }
    });
  } catch (error) {
    next(error);
  }
});

// Delete file (Admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete from S3
    await S3Service.deleteFile(file.s3Key);

    // Remove from module
    await Module.findByIdAndUpdate(file.module, {
      $pull: { files: file._id }
    });

    // Delete from database
    await File.findByIdAndDelete(req.params.id);

    logger.info(`File deleted: ${file.originalName} by ${req.user.name}`);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;