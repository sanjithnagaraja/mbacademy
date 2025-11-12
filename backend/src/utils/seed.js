import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import logger from '../services/logger.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    logger.info('Cleared existing data');

    // Create users
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@modernba.com',
      role: 'admin',
      isActive: true
    });

    const teacherUser = new User({
      name: 'John Teacher',
      email: 'teacher@modernba.com',
      role: 'teacher',
      isActive: true
    });

    const studentUser = new User({
      name: 'Jane Student',
      email: 'student@modernba.com',
      role: 'student',
      isActive: true
    });

    await Promise.all([adminUser.save(), teacherUser.save(), studentUser.save()]);
    logger.info('Created users');

    // Create courses
    const course1 = new Course({
      title: 'Introduction to Business Management',
      description: 'Learn the fundamentals of business management including planning, organizing, leading, and controlling organizational resources.',
      instructor: teacherUser._id,
      category: 'Business',
      level: 'Beginner',
      duration: 40,
      price: 299,
      tags: ['management', 'business', 'leadership'],
      isPublished: true,
      enrolledStudents: [studentUser._id]
    });

    const course2 = new Course({
      title: 'Digital Marketing Strategies',
      description: 'Master modern digital marketing techniques including SEO, social media marketing, email marketing, and analytics.',
      instructor: teacherUser._id,
      category: 'Marketing',
      level: 'Intermediate',
      duration: 35,
      price: 399,
      tags: ['digital marketing', 'SEO', 'social media'],
      isPublished: true,
      enrolledStudents: [studentUser._id]
    });

    const course3 = new Course({
      title: 'Financial Analysis and Planning',
      description: 'Comprehensive course on financial analysis, budgeting, forecasting, and strategic financial planning.',
      instructor: teacherUser._id,
      category: 'Finance',
      level: 'Advanced',
      duration: 50,
      price: 499,
      tags: ['finance', 'analysis', 'planning'],
      isPublished: true
    });

    await Promise.all([course1.save(), course2.save(), course3.save()]);
    logger.info('Created courses');

    // Create modules for course 1
    const modules1 = [
      {
        title: 'Introduction to Management',
        description: 'Overview of management principles and theories',
        course: course1._id,
        order: 1,
        content: 'This module introduces the basic concepts of management...',
        duration: 120,
        isPublished: true
      },
      {
        title: 'Planning and Strategy',
        description: 'Strategic planning and goal setting',
        course: course1._id,
        order: 2,
        content: 'Learn about strategic planning processes...',
        duration: 150,
        isPublished: true
      },
      {
        title: 'Leadership and Team Management',
        description: 'Effective leadership techniques and team building',
        course: course1._id,
        order: 3,
        content: 'Explore different leadership styles...',
        duration: 180,
        isPublished: true
      }
    ];

    // Create modules for course 2
    const modules2 = [
      {
        title: 'Digital Marketing Fundamentals',
        description: 'Introduction to digital marketing channels',
        course: course2._id,
        order: 1,
        content: 'Understanding the digital marketing landscape...',
        duration: 100,
        isPublished: true
      },
      {
        title: 'Search Engine Optimization',
        description: 'SEO strategies and best practices',
        course: course2._id,
        order: 2,
        content: 'Learn how to optimize websites for search engines...',
        duration: 140,
        isPublished: true
      }
    ];

    const allModules = [...modules1, ...modules2];
    await Module.insertMany(allModules);
    logger.info('Created modules');

    // Update course module counts
    await Course.findByIdAndUpdate(course1._id, { totalModules: modules1.length });
    await Course.findByIdAndUpdate(course2._id, { totalModules: modules2.length });

    // Update user assigned courses
    await User.findByIdAndUpdate(teacherUser._id, {
      assignedCourses: [course1._id, course2._id, course3._id]
    });
    await User.findByIdAndUpdate(studentUser._id, {
      assignedCourses: [course1._id, course2._id]
    });

    logger.info('Seed data created successfully!');
    console.log('\n=== SEED DATA SUMMARY ===');
    console.log('Admin User: admin@modernba.com');
    console.log('Teacher User: teacher@modernba.com');
    console.log('Student User: student@modernba.com');
    console.log('Courses Created: 3');
    console.log('Modules Created:', allModules.length);
    console.log('========================\n');

  } catch (error) {
    logger.error('Seed data creation failed:', error);
    console.error('Seeding failed:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedData();