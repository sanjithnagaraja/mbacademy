import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  Upload, 
  Users, 
  BarChart3, 
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Clock,
  File,
  Download,
  Eye,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { courseService, moduleService, fileService, userService } from '../utils/api';

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    name: string;
  };
  category: string;
  level: string;
  duration: number;
  price: number;
  enrolledStudents: string[];
  totalModules: number;
  isPublished: boolean;
  createdAt: string;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  course: { _id: string; title: string };
  order: number;
  content: string;
  duration: number;
  files: Array<{ _id: string; originalName: string; fileType: string }>;
  isPublished: boolean;
  createdAt: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const TeacherDashboard: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const sidebarItems = [
    { name: 'Overview', path: '/teacher', icon: BarChart3 },
    { name: 'My Courses', path: '/teacher/courses', icon: BookOpen },
    { name: 'Modules', path: '/teacher/modules', icon: FileText },
    { name: 'Upload Files', path: '/teacher/upload', icon: Upload },
    { name: 'Students', path: '/teacher/students', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-neutral-200">
        <div className="p-6">
          <h2 className="font-heading text-xl font-bold text-neutral-800">Teacher Dashboard</h2>
          <p className="text-sm text-neutral-600 mt-1">Welcome, {user?.name}</p>
        </div>
        <nav className="px-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<TeacherOverview />} />
          <Route path="/courses" element={<TeacherCourses />} />
          <Route path="/modules" element={<TeacherModules />} />
          <Route path="/upload" element={<TeacherUpload />} />
          <Route path="/students" element={<TeacherStudents />} />
        </Routes>
      </div>
    </div>
  );
};

// Teacher Overview Component
const TeacherOverview: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalModules: 0,
    avgRating: 4.8
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      if (user?.assignedCourses) {
        const coursePromises = user.assignedCourses.map(course => 
          courseService.getCourse(course._id)
        );
        const courseResults = await Promise.all(coursePromises);
        
        let totalStudents = 0;
        let totalModules = 0;
        
        courseResults.forEach(result => {
          const course = result.data.data.course;
          totalStudents += course.enrolledStudents.length;
          totalModules += course.totalModules || 0;
        });

        setStats({
          totalCourses: user.assignedCourses.length,
          totalStudents,
          totalModules,
          avgRating: 4.8
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-4 bg-neutral-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-neutral-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-6">
        Welcome back, {user?.name}!
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-neutral-800 mb-2">My Courses</h3>
              <p className="text-2xl font-bold text-primary-600">{stats.totalCourses}</p>
            </div>
            <BookOpen className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-neutral-800 mb-2">Total Students</h3>
              <p className="text-2xl font-bold text-secondary-600">{stats.totalStudents}</p>
            </div>
            <Users className="w-8 h-8 text-secondary-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-neutral-800 mb-2">Total Modules</h3>
              <p className="text-2xl font-bold text-accent-600">{stats.totalModules}</p>
            </div>
            <FileText className="w-8 h-8 text-accent-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-neutral-800 mb-2">Course Rating</h3>
              <p className="text-2xl font-bold text-green-600">{stats.avgRating}/5</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="font-heading text-xl font-semibold text-neutral-800">My Courses</h2>
        </div>
        <div className="p-6">
          {user?.assignedCourses && user.assignedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.assignedCourses.map((course) => (
                <div key={course._id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="h-32 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg mb-4 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-2">{course.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Active</span>
                    <Link
                      to="/teacher/modules"
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-600 mb-2">No courses assigned</h3>
              <p className="text-neutral-500">Contact your administrator to get assigned to courses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Teacher Courses Component
const TeacherCourses: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      if (user?.assignedCourses) {
        const coursePromises = user.assignedCourses.map(course => 
          courseService.getCourse(course._id)
        );
        const courseResults = await Promise.all(coursePromises);
        setCourses(courseResults.map(result => result.data.data.course));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-64 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-6 bg-neutral-200 rounded w-48 mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-6">My Courses</h1>
      
      {courses.length > 0 ? (
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-xl shadow-sm border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-neutral-800 mb-2">
                      {course.title}
                    </h2>
                    <p className="text-neutral-600">{course.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-neutral-500">
                      {course.enrolledStudents.length} students enrolled
                    </div>
                    <div className="text-sm text-neutral-500">
                      {course.totalModules} modules
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-600">Category:</span>
                    <span className="ml-2 font-medium">{course.category}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Level:</span>
                    <span className="ml-2 font-medium">{course.level}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Duration:</span>
                    <span className="ml-2 font-medium">{course.duration} hours</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.isPublished 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <Link
                    to="/teacher/modules"
                    className="btn btn-primary"
                  >
                    Manage Modules
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200 text-center">
          <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600 mb-2">No courses assigned</h3>
          <p className="text-neutral-500">Contact your administrator to get assigned to courses.</p>
        </div>
      )}
    </div>
  );
};

// Teacher Modules Component (similar to AdminModules but restricted to teacher's courses)
const TeacherModules: React.FC = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    content: '',
    duration: 0,
    isPublished: false,
  });

  useEffect(() => {
    if (selectedCourseId) fetchModules();
    else setModules([]);
  }, [selectedCourseId]);

  const fetchModules = async () => {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      const response = await moduleService.getModulesByCourse(selectedCourseId);
      setModules(response.data.data.modules);
      
    } catch (error: any) {
      showToast('error', 'Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const handleCreateModule = async () => {
    try {
      setActionLoading(true);
      const moduleData = { ...formData, courseId: selectedCourseId };
      await moduleService.createModule(moduleData);
      await fetchModules();
      setShowCreateModal(false);
      setFormData({ title: '', description: '', order: 1, content: '', duration: 0, isPublished: false });
      showToast('success', 'Module created successfully');
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to create module');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description,
      order: module.order,
      content: module.content,
      duration: module.duration,
      isPublished: module.isPublished,
    });
    setShowEditModal(true);
  };

  const handleUpdateModule = async () => {
    if (!editingModule) return;
    try {
      setActionLoading(true);
      await moduleService.updateModule(editingModule._id, formData);
      await fetchModules();
      setShowEditModal(false);
      setEditingModule(null);
      showToast('success', 'Module updated successfully');
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to update module');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-2">Module Management</h1>
          <p className="text-neutral-600">Create and manage modules for your courses</p>
        </div>
        {selectedCourseId && (
          <button
            onClick={() => {
              setFormData({ title: '', description: '', order: modules.length + 1, content: '', duration: 0, isPublished: false });
              setShowCreateModal(true);
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Module</span>
          </button>
        )}
      </div>

      {/* Course Selection */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Select Course</label>
            <div className="relative">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">Choose a course to manage modules</option>
                {user?.assignedCourses?.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Modules Content */}
      {!selectedCourseId ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-200 text-center">
          <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600 mb-2">Select a Course</h3>
          <p className="text-neutral-500">Choose a course from the dropdown above to view and manage its modules.</p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-neutral-600 mt-4">Loading modules...</p>
        </div>
      ) : modules.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-neutral-200 text-center">
          <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600 mb-2">No modules found</h3>
          <p className="text-neutral-500 mb-4">This course doesn't have any modules yet.</p>
          <button
            onClick={() => {
              setFormData({ title: '', description: '', order: 1, content: '', duration: 0, isPublished: false });
              setShowCreateModal(true);
            }}
            className="btn btn-primary"
          >
            Create First Module
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {modules.map(module => (
              <div key={module._id} className="p-6 hover:bg-neutral-50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">{module.order}</div>
                      <h3 className="font-semibold text-neutral-800">{module.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${module.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {module.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-neutral-600 mb-3">{module.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-neutral-500">
                      <div className="flex items-center space-x-1"><Clock className="w-4 h-4" /><span>{module.duration} minutes</span></div>
                      <div className="flex items-center space-x-1"><File className="w-4 h-4" /><span>{module.files.length} file{module.files.length !== 1 ? 's' : ''}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button onClick={() => handleEditModule(module)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="Edit module"><Edit className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Module Modals */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="font-heading text-xl font-semibold text-neutral-800">
                {showCreateModal ? 'Create New Module' : `Edit Module: ${editingModule?.title}`}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingModule(null);
                }}
                className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Module Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="input"
                      placeholder="Enter module title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Order *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="input resize-none"
                    placeholder="Enter module description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="input resize-none"
                    placeholder="Enter module content (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className="input"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-neutral-700">Publish module</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-neutral-200">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingModule(null);
                }}
                disabled={actionLoading}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={showCreateModal ? handleCreateModule : handleUpdateModule}
                disabled={actionLoading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{showCreateModal ? 'Create Module' : 'Update Module'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Teacher Upload Component
const TeacherUpload: React.FC = () => {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (selectedCourseId) fetchModules();
    else setModules([]);
  }, [selectedCourseId]);

  const fetchModules = async () => {
    try {
      const response = await moduleService.getModulesByCourse(selectedCourseId);
      setModules(response.data.data.modules);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles || !selectedModuleId) return;

    try {
      setUploading(true);
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('moduleId', selectedModuleId);
        formData.append('description', fileDescription);

        await fileService.uploadFile(formData);
      }

      setSelectedFiles(null);
      setFileDescription('');
      showToast('success', `${selectedFiles.length} file(s) uploaded successfully`);
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-6">Upload Course Materials</h1>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <div className="space-y-6">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Select Course</label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedModuleId('');
              }}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Choose a course</option>
              {user?.assignedCourses?.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Module Selection */}
          {selectedCourseId && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Select Module</label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Choose a module</option>
                {modules.map(module => (
                  <option key={module._id} value={module._id}>
                    {module.order}. {module.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* File Upload */}
          {selectedModuleId && (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Select Files</label>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, images, videos
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Description (Optional)</label>
                <textarea
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Brief description of the files..."
                />
              </div>

              {selectedFiles && (
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">Selected Files:</p>
                  <div className="space-y-1">
                    {Array.from(selectedFiles).map((file, index) => (
                      <div key={index} className="text-sm text-neutral-600 bg-neutral-50 p-2 rounded">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleFileUpload}
                  disabled={!selectedFiles || uploading}
                  className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Files</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Teacher Students Component
const TeacherStudents: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      if (user?.assignedCourses) {
        const coursePromises = user.assignedCourses.map(course => 
          courseService.getCourse(course._id)
        );
        const courseResults = await Promise.all(coursePromises);
        
        // Get all unique students from all courses
        const allStudents = new Map();
        courseResults.forEach(result => {
          const course = result.data.data.course;
          course.enrolledStudents.forEach((student: any) => {
            if (!allStudents.has(student._id)) {
              allStudents.set(student._id, {
                ...student,
                courses: [course.title]
              });
            } else {
              const existingStudent = allStudents.get(student._id);
              existingStudent.courses.push(course.title);
            }
          });
        });
        
        setStudents(Array.from(allStudents.values()));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-64 mb-8"></div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-neutral-200 rounded w-48 mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-6">My Students</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="font-heading text-xl font-semibold text-neutral-800">
            Enrolled Students ({students.length})
          </h2>
        </div>
        <div className="p-6">
          {students.length > 0 ? (
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student._id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-800">{student.name}</h3>
                      <p className="text-sm text-neutral-600">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-neutral-600">
                      Enrolled in: {student.courses.join(', ')}
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      Active Student
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-600 mb-2">No students enrolled</h3>
              <p className="text-neutral-500">Students will appear here once they are enrolled in your courses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;