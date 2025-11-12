import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { BookOpen, Play, Download, User, Award, Clock, FileText, Eye, CheckCircle, Circle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { moduleService, fileService } from '../utils/api';

interface Module {
  _id: string;
  title: string;
  description: string;
  course: { _id: string; title: string };
  order: number;
  content: string;
  duration: number;
  files: Array<{ 
    _id: string; 
    originalName: string; 
    fileType: string; 
    fileSize: number;
    description: string;
  }>;
  isPublished: boolean;
  createdAt: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const StudentDashboard: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const sidebarItems = [
    { name: 'Overview', path: '/student', icon: BookOpen },
    { name: 'My Courses', path: '/student/courses', icon: Play },
    { name: 'Profile', path: '/student/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-neutral-200">
        <div className="p-6">
          <h2 className="font-heading text-xl font-bold text-neutral-800">Student Dashboard</h2>
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
          <Route path="/" element={<StudentOverview />} />
          <Route path="/courses" element={<StudentCourses />} />
          <Route path="/profile" element={<StudentProfile />} />
        </Routes>
      </div>
    </div>
  );
};

// Student Dashboard Components
const StudentOverview: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedModules: 0,
    totalModules: 0,
    studyHours: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      if (user?.assignedCourses) {
        let totalModules = 0;
        let totalHours = 0;

        for (const course of user.assignedCourses) {
          try {
            const response = await moduleService.getModulesByCourse(course._id);
            const modules = response.data.data.modules;
            totalModules += modules.length;
            totalHours += modules.reduce((sum: number, module: any) => sum + (module.duration || 0), 0);
          } catch (error) {
            console.error(`Error fetching modules for course ${course._id}:`, error);
          }
        }

        setStats({
          totalCourses: user.assignedCourses.length,
          completedModules: Math.floor(totalModules * 0.6), // Mock completion
          totalModules,
          studyHours: Math.floor(totalHours / 60) // Convert minutes to hours
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
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

  const completionRate = stats.totalModules > 0 ? Math.round((stats.completedModules / stats.totalModules) * 100) : 0;

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-6">
        Welcome back, {user?.name}!
      </h1>
      
      <div className="flex flex-col lg:flex-row w-full justify-center items-center  gap-4 lg:gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 w-full lg:w-1/2 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-neutral-800 mb-2">Enrolled Courses</h3>
              <p className="text-2xl font-bold text-primary-600">
                {stats.totalCourses}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        
        {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-neutral-800 mb-2">Completion Rate</h3>
              <p className="text-2xl font-bold text-secondary-600">{completionRate}%</p>
            </div>
            <Award className="w-8 h-8 text-secondary-600" />
          </div>
        </div> */}
        
        {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-neutral-800 mb-2">Study Hours</h3>
              <p className="text-2xl font-bold text-accent-600">{stats.studyHours}-hours</p>
            </div>
            <Clock className="w-8 h-8 text-accent-600" />
          </div>
        </div> */}

        <div className="bg-white rounded-xl w-full lg:w-1/2 p-6 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-neutral-800 mb-2">Modules</h3>
              <p className="text-2xl font-bold text-green-600">{stats.totalModules}</p>
            </div>
            <FileText className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {/* <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-8">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Learning Progress</h2>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-neutral-600 mb-2">
              <span>Overall Progress</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-neutral-600">
            You've completed {stats.completedModules} out of {stats.totalModules} modules across all your courses.
          </p>
        </div>
      </div> */}

      {/* Assigned Courses */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Your Courses</h2>
        </div>
        <div className="p-6">
          {user?.assignedCourses && user.assignedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.assignedCourses.map((course) => (
                <div key={course._id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="h-32 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg mb-4 flex items-center justify-center">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-primary-600" />
                    )}
                  </div>
                  <h3 className="font-semibold text-neutral-800 mb-2">{course.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">In Progress</span>
                    <Link
                      to="/student/courses"
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Continue →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-600 mb-2">No courses assigned</h3>
              <p className="text-neutral-500">Contact your administrator to get enrolled in courses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentCourses: React.FC = () => {
  const { user } = useAuth();
  const [courseModules, setCourseModules] = useState<{ [key: string]: Module[] }>({});
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchCourseModules();
  }, [user]);

  const fetchCourseModules = async () => {
    if (!user?.assignedCourses) return;

    try {
      const modulePromises = user.assignedCourses.map(async (course) => {
        
        try {
          const response = await moduleService.getModulesByCourse(course._id);
          console.log(response);
          
          return { courseId: course._id, modules: response.data.data.modules };
        } catch (error) {
          console.error(`Error fetching modules for course ${course._id}:`, error);
          return { courseId: course._id, modules: [] };
        }
      });

      const results = await Promise.all(modulePromises);
      const modulesMap: { [key: string]: Module[] } = {};
      
      results.forEach(({ courseId, modules }) => {
        modulesMap[courseId] = modules;
      });

      setCourseModules(modulesMap);
    } catch (error) {
      console.error('Error fetching course modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await fileService.getFileUrl(fileId);
      const link = document.createElement('a');
      link.href = response.data.data.url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('success', 'File downloaded successfully');
    } catch (error: any) {
      showToast('error', 'Failed to download file');
    }
  };

  const handleFilePreview = async (fileId: string, fileName: string) => {
    try {
      const response = await fileService.getFileUrl(fileId);
      window.open(response.data.data.url, '_blank');
      showToast('success', `Opening ${fileName}`);
    } catch (error: any) {
      showToast('error', 'Failed to preview file');
    }
  };

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-64 mb-8"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-6 bg-neutral-200 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-neutral-200 rounded w-full"></div>
                  ))}
                </div>
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
      
      {user?.assignedCourses && user.assignedCourses.length > 0 ? (
        <div className="space-y-6">
          {user.assignedCourses.map((course) => (
            <div key={course._id} className="bg-white rounded-xl shadow-sm border border-neutral-200">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="font-heading text-xl font-semibold text-neutral-800">
                  {course.title}
                </h2>
              </div>
              <div className="p-6">
                {courseModules[course._id] && courseModules[course._id].length > 0 ? (
                  <div className="space-y-4">
                    {courseModules[course._id].map((module, index) => (
                      <div
                        key={module._id}
                        className="border border-neutral-200 rounded-lg overflow-hidden"
                      >
                        <div 
                          className="p-4 hover:bg-neutral-50 transition-colors duration-200 cursor-pointer"
                          onClick={() => toggleModuleExpansion(module._id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <h3 className="font-medium text-neutral-800">{module.title}</h3>
                                <p className="text-sm text-neutral-600">{module.description}</p>
                                <div className="flex items-center mt-1 space-x-4 text-xs text-neutral-500">
                                  {module.duration && (
                                    <div className="flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {module.duration} minutes
                                    </div>
                                  )}
                                  {module.files && module.files.length > 0 && (
                                    <div className="flex items-center">
                                      <FileText className="w-3 h-3 mr-1" />
                                      {module.files.length} file{module.files.length > 1 ? 's' : ''}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Circle className="w-4 h-4 text-neutral-400" />
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {expandedModules[module._id] ? 'Collapse' : 'Expand'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {expandedModules[module._id] && (
                          <div className="border-t border-neutral-200 bg-neutral-50">
                            {module.content && (
                              <div className="p-4 border-b border-neutral-200 bg-white">
                                <h4 className="font-medium text-neutral-800 mb-2">Module Content</h4>
                                <div className="text-sm text-neutral-700 whitespace-pre-wrap">
                                  {module.content}
                                </div>
                              </div>
                            )}
                            
                            {module.files && module.files.length > 0 && (
                              <div className="p-4">
                                <h4 className="font-medium text-neutral-800 mb-3">Course Materials</h4>
                                <div className="space-y-2">
                                  {module.files.map((file) => (
                                    <div
                                      key={file._id}
                                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200 hover:shadow-sm transition-shadow duration-200"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                          <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-neutral-800">{file.originalName}</p>
                                          <div className="flex items-center space-x-2 text-xs text-neutral-500">
                                            <span>{formatFileSize(file.fileSize)}</span>
                                            <span>•</span>
                                            <span className="capitalize">{file.fileType.split('/')[1] || 'File'}</span>
                                          </div>
                                          {file.description && (
                                            <p className="text-xs text-neutral-600 mt-1">{file.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => handleFilePreview(file._id, file.originalName)}
                                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                          title="Preview file"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => handleFileDownload(file._id, file.originalName)}
                                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                          title="Download file"
                                        >
                                          <Download className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-600">No modules available for this course yet.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200 text-center">
          <BookOpen className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-600 mb-2">No courses assigned</h3>
          <p className="text-neutral-500">Contact your administrator to get enrolled in courses.</p>
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
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StudentProgress: React.FC = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      if (user?.assignedCourses) {
        const progressPromises = user.assignedCourses.map(async (course) => {
          try {
            const response = await moduleService.getModulesByCourse(course._id);
            const modules = response.data.data.modules;
            const completedModules = Math.floor(modules.length * 0.6); // Mock completion
            
            return {
              courseId: course._id,
              courseTitle: course.title,
              totalModules: modules.length,
              completedModules,
              progress: modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0,
              totalDuration: modules.reduce((sum: number, module: any) => sum + (module.duration || 0), 0)
            };
          } catch (error) {
            return {
              courseId: course._id,
              courseTitle: course.title,
              totalModules: 0,
              completedModules: 0,
              progress: 0,
              totalDuration: 0
            };
          }
        });

        const results = await Promise.all(progressPromises);
        setProgressData(results);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
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
                <div className="h-2 bg-neutral-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const overallProgress = progressData.length > 0 
    ? Math.round(progressData.reduce((sum, course) => sum + course.progress, 0) / progressData.length)
    : 0;

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-6">Progress & Achievements</h1>
      
      {/* Overall Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-8">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Overall Progress</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium text-neutral-800">Learning Progress</span>
            <span className="text-2xl font-bold text-primary-600">{overallProgress}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3 mb-4">
            <div 
              className="bg-primary-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-neutral-600">
            You're making great progress! Keep up the excellent work.
          </p>
        </div>
      </div>

      {/* Course Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="font-heading text-xl font-semibold text-neutral-800">Course Progress</h2>
        </div>
        <div className="p-6">
          {progressData.length > 0 ? (
            <div className="space-y-6">
              {progressData.map((course) => (
                <div key={course.courseId} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-neutral-800">{course.courseTitle}</h3>
                    <span className="text-sm font-medium text-primary-600">{course.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-neutral-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-600">Modules:</span>
                      <span className="ml-2 font-medium">{course.completedModules}/{course.totalModules}</span>
                    </div>
                    <div>
                      <span className="text-neutral-600">Duration:</span>
                      <span className="ml-2 font-medium">{Math.floor(course.totalDuration / 60)}h {course.totalDuration % 60}m</span>
                    </div>
                    <div>
                      <span className="text-neutral-600">Status:</span>
                      <span className={`ml-2 font-medium ${
                        course.progress === 100 ? 'text-green-600' : 
                        course.progress > 50 ? 'text-blue-600' : 'text-yellow-600'
                      }`}>
                        {course.progress === 100 ? 'Completed' : 
                         course.progress > 50 ? 'In Progress' : 'Getting Started'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-600 mb-2">No progress data</h3>
              <p className="text-neutral-500">Start learning to see your progress here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-6">Profile</h1>
      <div className="bg-white rounded-xl p-6 w-full shadow-sm border border-neutral-200">
        
        
        <div className="flex flex-col lg:flex-row w-full gap-6">
          <div className="flex items-center space-x-6 mb-6 w-full lg:w-1/2">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
          )}
          <div>
            <h2 className="font-heading text-3xl font-semibold text-neutral-800">{user?.name}</h2>
            <p className="text-neutral-600">{user?.email}</p>
            <p className="text-sm text-neutral-500 capitalize">Role: {user?.role}</p>
          </div>
        </div>
          <div className=' w-full lg:w-1/2'>
            <h3 className="font-semibold text-neutral-800 mb-3 text-2xl">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Member since:</span>
                <span className="text-neutral-800">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Enrolled courses:</span>
                <span className="text-neutral-800">{user?.assignedCourses?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Account status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>
          
          {/* <div>
            <h3 className="font-semibold text-neutral-800 mb-3">Learning Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Completion rate:</span>
                <span className="text-neutral-800">75%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Total study time:</span>
                <span className="text-neutral-800">42 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Certificates earned:</span>
                <span className="text-neutral-800">2</span>
              </div>
            </div>
          </div> */}
        </div>

        {/* Enrolled Courses */}
        <div className="mt-8">
          <h3 className="font-semibold text-neutral-800 mb-3">Enrolled Courses</h3>
          {user?.assignedCourses && user.assignedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.assignedCourses.map((course) => (
                <div key={course._id} className="border border-neutral-200 rounded-lg p-3">
                  <h4 className="font-medium text-neutral-800">{course.title}</h4>
                  <p className="text-sm text-neutral-600 mt-1">Active enrollment</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No courses enrolled</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;