import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  assignedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Only keep indexes that are not already covered by unique constraints
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('displayName').get(function() {
  return this.name;
});
userSchema.methods.hasAccessToCourse = async function(courseId) {
  if (this.role === 'admin') return true;

  // Teacher: must be the instructor of the course
  if (this.role === 'teacher') {
    const course = await mongoose.model('Course')
      .findById(courseId)
      .select('instructor');
    if (course && course.instructor.toString() === this._id.toString()) {
      return true;
    }
  }

  // Student: check if they are enrolled in this course
  if (this.role === 'student') {
    const course = await mongoose.model('Course')
      .findById(courseId)
      .select('enrolledStudents');
    if (course && course.enrolledStudents.some(id => id.toString() === this._id.toString())) {
      return true;
    }
  }

  return false;
};




// Method to check if user can manage course
userSchema.methods.canManageCourse = function(courseId) {
  if (this.role === 'admin') return true;
  if (this.role === 'teacher') {
    return this.assignedCourses.some(id => id.toString() === courseId.toString());
  }
  return false;
};

export default mongoose.model('User', userSchema);
