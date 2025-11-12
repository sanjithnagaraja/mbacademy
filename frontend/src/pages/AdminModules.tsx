import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown,
  X,
  Check,
  AlertTriangle,
  BookOpen,
  Clock,
  File,
  Upload,
  Download,
  Eye
} from 'lucide-react';
import { moduleService, courseService, fileService } from '../utils/api';

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
  updatedAt: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: { _id: string; name: string };
  totalModules: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ModuleFormData {
  title: string;
  description: string;
  courseId: string;
  order: number;
  content: string;
  duration: number;
  isPublished: boolean;
}

interface ModuleFormErrors {
  title?: string;
  description?: string;
  courseId?: string;
  order?: string;
  content?: string;
  duration?: string;
  isPublished?: string;
}

const AdminModules: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [deletingModule, setDeletingModule] = useState<Module | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // File upload states
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [selectedModuleForUpload, setSelectedModuleForUpload] = useState<Module | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [fileDescription, setFileDescription] = useState('');

  const initialFormData: ModuleFormData = {
    title: '',
    description: '',
    courseId: '',
    order: 1,
    content: '',
    duration: 0,
    isPublished: false,
  };

  const [formData, setFormData] = useState<ModuleFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<ModuleFormErrors>({});

  useEffect(() => { fetchCourses(); }, []);

  useEffect(() => {
    if (selectedCourseId) fetchModules();
    else setModules([]);
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getCourses({ limit: 100 });
      setCourses(response.data.data.courses);
    } catch (error) {
      showToast('error', 'Failed to fetch courses');
      console.error('Error fetching courses:', error);
    }
  };

  const fetchModules = async () => {
    if (!selectedCourseId) return;
    try {
      setLoading(true);
      const response = await moduleService.getModulesByCourse(selectedCourseId);
      setModules(response.data.data.modules);
    } catch (error: any) {
      showToast('error', 'Failed to fetch modules');
      console.error('Error fetching modules:', error);
    } finally { setLoading(false); }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  };

  const validateForm = (data: ModuleFormData): boolean => {
    const errors: ModuleFormErrors = {};
    if (!data.title.trim()) errors.title = 'Title is required';
    if (!data.description.trim()) errors.description = 'Description is required';
    if (!data.courseId) errors.courseId = 'Course is required';
    if (data.order <= 0) errors.order = 'Order must be greater than 0';
    if (data.duration < 0) errors.duration = 'Duration cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getNextOrder = (): number => modules.length === 0 ? 1 : Math.max(...modules.map(m => m.order)) + 1;

  const handleCreateModule = async () => {
    const moduleData = { ...formData, courseId: selectedCourseId };
    if (!validateForm(moduleData)) return;
    try {
      setActionLoading(true);
      await moduleService.createModule(moduleData);
      await fetchModules();
      setShowCreateModal(false);
      setFormData(initialFormData);
      showToast('success', 'Module created successfully');
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to create module');
    } finally { setActionLoading(false); }
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description,
      courseId: module.course._id,
      order: module.order,
      content: module.content,
      duration: module.duration,
      isPublished: module.isPublished,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleUpdateModule = async () => {
    if (!editingModule || !validateForm(formData)) return;
    try {
      setActionLoading(true);
      await moduleService.updateModule(editingModule._id, formData);
      await fetchModules();
      setShowEditModal(false);
      setEditingModule(null);
      setFormData(initialFormData);
      showToast('success', 'Module updated successfully');
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to update module');
    } finally { setActionLoading(false); }
  };

  const handleDeleteModule = (module: Module) => {
    setDeletingModule(module);
    setShowDeleteModal(true);
  };

  const confirmDeleteModule = async () => {
    if (!deletingModule) return;
    try {
      setActionLoading(true);
      await moduleService.deleteModule(deletingModule._id);
      await fetchModules();
      setShowDeleteModal(false);
      setDeletingModule(null);
      showToast('success', 'Module deleted successfully');
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to delete module');
    } finally { setActionLoading(false); }
  };

  const handleFileUpload = (module: Module) => {
    setSelectedModuleForUpload(module);
    setSelectedFiles(null);
    setFileDescription('');
    setShowFileUploadModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const uploadFiles = async () => {
    if (!selectedFiles || !selectedModuleForUpload) return;

    try {
      setUploadingFiles(true);
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('moduleId', selectedModuleForUpload._id);
        formData.append('description', fileDescription);

        await fileService.uploadFile(formData);
      }

      await fetchModules();
      setShowFileUploadModal(false);
      setSelectedModuleForUpload(null);
      setSelectedFiles(null);
      setFileDescription('');
      showToast('success', `${selectedFiles.length} file(s) uploaded successfully`);
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to upload files');
    } finally {
      setUploadingFiles(false);
    }
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
    } catch (error: any) {
      showToast('error', 'Failed to download file');
    }
  };

  const handleFilePreview = async (fileId: string) => {
    try {
      const response = await fileService.getFileUrl(fileId);
      window.open(response.data.data.url, '_blank');
    } catch (error: any) {
      showToast('error', 'Failed to preview file');
    }
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setFormData(prev => ({ ...prev, courseId, order: 1 }));
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const selectedCourse = courses.find(c => c._id === selectedCourseId);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-neutral-800 mb-2">Module Management</h1>
          <p className="text-neutral-600">Create and manage course modules</p>
        </div>
        {selectedCourseId && (
          <button
            onClick={() => {
              setFormData({ ...initialFormData, courseId: selectedCourseId, order: getNextOrder() });
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
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="">Choose a course to manage modules</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title} (Instructor: {course.instructor.name})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
          {selectedCourse && (
            <div className="text-sm text-neutral-600">
              <div className="font-medium">{selectedCourse.totalModules} modules</div>
            </div>
          )}
        </div>
      </div>

      {/* Modules Content */}
      {!selectedCourse?._id ? (
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
              setFormData({ ...initialFormData, courseId: selectedCourseId, order: 1 });
              setShowCreateModal(true);
            }}
            className="btn btn-primary"
          >
            Create First Module
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="font-heading text-xl font-semibold text-neutral-800">Modules for: {selectedCourse?.title}</h2>
          </div>
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
                      <div className="text-neutral-400">Created {formatDate(module.createdAt)}</div>
                    </div>
                    {module.content && <div className="mt-3 p-3 bg-neutral-50 rounded-lg"><p className="text-sm text-neutral-700 line-clamp-3">{module.content}</p></div>}
                    {module.files.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{module.files.map(file => (
                      <div key={file._id} className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        <File className="w-3 h-3" />
                        <span>{file.originalName}</span>
                        <button onClick={() => handleFilePreview(file._id)} className="ml-1 text-blue-600 hover:text-blue-800"><Eye className="w-3 h-3" /></button>
                        <button onClick={() => handleFileDownload(file._id, file.originalName)} className="ml-1 text-blue-600 hover:text-blue-800"><Download className="w-3 h-3" /></button>
                      </div>
                    ))}</div>}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button onClick={() => handleEditModule(module)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="Edit module"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleFileUpload(module)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200" title="Upload files"><Upload className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteModule(module)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200" title="Delete module"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      

      {/* Create Module Modal */}
      {showCreateModal && (
        <ModuleModal
          title="Create New Module"
          formData={formData}
          formErrors={formErrors}
          courses={courses}
          onClose={() => {
            setShowCreateModal(false);
            setFormData(initialFormData);
            setFormErrors({});
          }}
          onSave={handleCreateModule}
          onChange={setFormData}
          loading={actionLoading}
        />
      )}

      {/* Edit Module Modal */}
      {showEditModal && editingModule && (
        <ModuleModal
          title={`Edit Module: ${editingModule.title}`}
          formData={formData}
          formErrors={formErrors}
          courses={courses}
          onClose={() => {
            setShowEditModal(false);
            setEditingModule(null);
            setFormData(initialFormData);
            setFormErrors({});
          }}
          onSave={handleUpdateModule}
          onChange={setFormData}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800">Delete Module</h3>
                  <p className="text-sm text-neutral-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-neutral-700 mb-6">
                Are you sure you want to delete "<strong>{deletingModule.title}</strong>"? 
                This will also delete all associated files.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingModule(null);
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteModule}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {actionLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileUploadModal && selectedModuleForUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="font-heading text-xl font-semibold text-neutral-800">
                Upload Files to: {selectedModuleForUpload.title}
              </h2>
              <button
                onClick={() => setShowFileUploadModal(false)}
                className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Select Files
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi"
                  onChange={handleFileSelect}
                  className="w-full p-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, images, videos
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description (Optional)
                </label>
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
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t border-neutral-200">
              <button
                onClick={() => setShowFileUploadModal(false)}
                disabled={uploadingFiles}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={uploadFiles}
                disabled={!selectedFiles || uploadingFiles}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {uploadingFiles && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>Upload Files</span>
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
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Module Modal Component
interface ModuleModalProps {
  title: string;
  formData: ModuleFormData;
  formErrors: ModuleFormErrors;
  courses: Course[];
  onClose: () => void;
  onSave: () => void;
  onChange: (data: ModuleFormData) => void;
  loading: boolean;
}

const ModuleModal: React.FC<ModuleModalProps> = ({
  title,
  formData,
  formErrors,
  courses,
  onClose,
  onSave,
  onChange,
  loading
}) => {
  const handleInputChange = (field: keyof ModuleFormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="font-heading text-xl font-semibold text-neutral-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Module Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`input ${formErrors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter module title"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Order *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
                  className={`input ${formErrors.order ? 'border-red-500' : ''}`}
                  placeholder="1"
                />
                {formErrors.order && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.order}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`input resize-none ${formErrors.description ? 'border-red-500' : ''}`}
                placeholder="Enter module description"
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={6}
                className="input resize-none"
                placeholder="Enter module content (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                className={`input ${formErrors.duration ? 'border-red-500' : ''}`}
                placeholder="0"
              />
              {formErrors.duration && (
                <p className="text-red-500 text-sm mt-1">{formErrors.duration}</p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-neutral-700">Publish module</span>
              </label>
              <p className="text-xs text-neutral-500 mt-1">
                Published modules will be visible to students
              </p>
            </div>
          </div>
        </div>

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
            <span>Save Module</span>
          </button>
        </div>
      </div>
    

    </div>
  );
};

export default AdminModules;