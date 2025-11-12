import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  content: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }]
}, {
  timestamps: true
});

// Compound index for course and order
moduleSchema.index({ course: 1, order: 1 }, { unique: true });
moduleSchema.index({ course: 1, isPublished: 1 });

// Pre-save middleware to ensure unique order within course
moduleSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('order')) {
    const existingModule = await this.constructor.findOne({
      course: this.course,
      order: this.order,
      _id: { $ne: this._id }
    });
    
    if (existingModule) {
      const error = new Error('Module order must be unique within a course');
      return next(error);
    }
  }
  next();
});

export default mongoose.model('Module', moduleSchema);