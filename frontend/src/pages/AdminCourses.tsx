import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  X
} from 'lucide-react';
import { courseService, userService } from '../utils/api';

// -------------------- Types --------------------
interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  price: number;
  tags: string[];
  isPublished: boolean;
  enrolledStudents: string[];
  totalModules: number;
  createdAt: string;
  updatedAt: string;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface CourseFormData {
  title: string;
  description: string;
  instructorId: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  price: number;
  tags: string;
  isPublished: boolean;
}

interface CourseFormErrors {
  title?: string;
  description?: string;
  instructorId?: string;
  category?: string;
  duration?: string;
  price?: string;
}

// -------------------- AdminCourses Component --------------------
const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const limit = 10;

  const initialFormData: CourseFormData = {
    title: '',
    description: '',
    instructorId: '',
    category: '',
    level: 'Beginner',
    duration: 0,
    price: 0,
    tags: '',
    isPublished: false,
  };

  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<CourseFormErrors>({});

  // -------------------- Effects --------------------
  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, [currentPage, searchTerm]);

  
  // -------------------- API Calls --------------------
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit };
      if (searchTerm) params.search = searchTerm;
      const response = await courseService.getCourses(params);
      console.log(response);
      
      setCourses(response.data.data.courses);
      console.log(courses);
      
      setTotalPages(response.data.data.pagination.pages);
    } catch (error: any) {
      showToast('error', 'Failed to fetch courses');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await userService.getUsers({ role: 'teacher', limit: 100 });
      setTeachers(response.data.data.users);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  // -------------------- Toast --------------------
  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  // -------------------- Validation --------------------
  const validateForm = (data: CourseFormData): boolean => {
    const errors: CourseFormErrors = {};
    if (!data.title.trim()) errors.title = 'Title is required';
    if (!data.description.trim()) errors.description = 'Description is required';
    if (!data.instructorId) errors.instructorId = 'Instructor is required';
    if (!data.category.trim()) errors.category = 'Category is required';
    if (data.duration <= 0) errors.duration = 'Duration must be greater than 0';
    if (data.price < 0) errors.price = 'Price cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // -------------------- Handlers --------------------
  const handleCreateCourse = async () => {
    if (!validateForm(formData)) return;
    try {
      setActionLoading(true);
      const courseData = { ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) };
      await courseService.createCourse(courseData);
      setCurrentPage(1);
      await fetchCourses();
      setFormData(initialFormData);
      setShowCreateModal(false);
      showToast('success', 'Course created successfully');
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to create course');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      instructorId: course.instructor._id,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      tags: course.tags.join(', '),
      isPublished: course.isPublished,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse || !validateForm(formData)) return;
    try {
      setActionLoading(true);
      const courseData = { ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) };
      await courseService.updateCourse(editingCourse._id, courseData);
      await fetchCourses();
      setShowEditModal(false);
      setEditingCourse(null);
      setFormData(initialFormData);
      showToast('success', 'Course updated successfully');
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to update course');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = (course: Course) => {
    setDeletingCourse(course);
    confirmDeleteCourse();
    setShowDeleteModal(true);
  };

  const confirmDeleteCourse = async () => {
    if (!deletingCourse) return;
    try {
      setActionLoading(true);
      await courseService.deleteCourse(deletingCourse._id);
      await fetchCourses();
      setShowDeleteModal(false);
      setDeletingCourse(null);
      showToast('success', 'Course deleted successfully');
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to delete course');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // -------------------- Render --------------------
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Course Management</h1>
        <button
          onClick={() => {
            setFormData(initialFormData);
            setFormErrors({});
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg"
        >
          <Plus className="w-4 h-4 inline mr-1" /> Add Course
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search courses..."
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {/* Courses Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course._id}>
                <td className="px-6 py-4 whitespace-nowrap">{course.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{course.instructor.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{course.price} LKR</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button onClick={() => handleEditCourse(course)} className="text-blue-600 hover:underline">
                    <Edit className="w-4 h-4 inline" /> Edit
                  </button>
                  <button onClick={() => handleDeleteCourse(course)} className="text-red-600 hover:underline">
                    <Trash2 className="w-4 h-4 inline" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CourseModal
          title="Create New Course"
          formData={formData}
          formErrors={formErrors}
          teachers={teachers}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateCourse}
          onChange={setFormData}
          loading={actionLoading}
        />
      )}

      {showEditModal && editingCourse && (
        <CourseModal
          title={`Edit Course: ${editingCourse.title}`}
          formData={formData}
          formErrors={formErrors}
          teachers={teachers}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateCourse}
          onChange={setFormData}
          loading={actionLoading}
        />
      )}

      {/* Toasts */}
      <div className="fixed top-4 right-4 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

// -------------------- Course Modal --------------------
interface CourseModalProps {
  title: string;
  formData: CourseFormData;
  formErrors: CourseFormErrors;
  teachers: Teacher[];
  onClose: () => void;
  onSave: () => void;
  onChange: (data: CourseFormData) => void;
  loading: boolean;
}

const CourseModal: React.FC<CourseModalProps> = ({
  title,
  formData,
  formErrors,
  teachers,
  onClose,
  onSave,
  onChange,
  loading
}) => {
  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="font-heading text-xl font-semibold text-neutral-800">{title}</h2>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full p-2 border rounded-lg ${formErrors.title ? 'border-red-500' : ''}`}
              placeholder="Course title"
            />
            {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full p-2 border rounded-lg ${formErrors.description ? 'border-red-500' : ''}`}
              placeholder="Course description"
              rows={4}
            />
            {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Instructor *</label>
            <select
              value={formData.instructorId}
              onChange={(e) => handleInputChange('instructorId', e.target.value)}
              className={`w-full p-2 border rounded-lg ${formErrors.instructorId ? 'border-red-500' : ''}`}
            >
              <option value="">Select Instructor</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            {formErrors.instructorId && <p className="text-red-500 text-sm mt-1">{formErrors.instructorId}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Category *</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full p-2 border rounded-lg ${formErrors.category ? 'border-red-500' : ''}`}
              placeholder="Category"
            />
            {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Level</label>
            <select
              value={formData.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Duration (months) *</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', Number(e.target.value))}
              className={`w-full p-2 border rounded-lg ${formErrors.duration ? 'border-red-500' : ''}`}
              placeholder="Duration in months"
            />
            {formErrors.duration && <p className="text-red-500 text-sm mt-1">{formErrors.duration}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Price (LKR) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', Number(e.target.value))}
              className={`w-full p-2 border rounded-lg ${formErrors.price ? 'border-red-500' : ''}`}
              placeholder="Price"
            />
            {formErrors.price && <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="e.g. JavaScript, React"
            />
          </div>

          {/* Published */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => handleInputChange('isPublished', e.target.checked)}
              className="h-4 w-4"
            />
            <label className="text-sm font-medium text-neutral-700">Published</label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-neutral-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>Save Course</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCourses;
