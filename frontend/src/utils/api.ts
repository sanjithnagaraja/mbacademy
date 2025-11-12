import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}` // or wherever you store the token
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authService = {
  googleLogin: (userData: any) => api.post('/auth/google', userData),
  verifyToken: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout'),
};

// User API
export const userService = {
  getProfile: () => api.get('/users/profile'),
  getUsers: (params?: any) => api.get('/users', { params }),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deactivateUser: (id: string) => api.put(`/users/${id}/deactivate`),
  getStats: () => api.get('/users/stats'),
};

// Course API
export const courseService = {
  getCourses: (params?: any) => api.get('/courses', { params }),
  getCourse: (id: string) => api.get(`/courses/${id}`),
  createCourse: (data: any) => api.post('/courses', data),
  updateCourse: (id: string, data: any) => api.put(`/courses/${id}`, data),
  deleteCourse: (id: string) => api.delete(`/courses/${id}`),
};

// Module API
export const moduleService = {
  getModulesByCourse: (courseId: string) => api.get(`/modules/course/${courseId}`),
  getModule: (id: string) => api.get(`/modules/${id}`),
  createModule: (data: any) => api.post('/modules', data),
  updateModule: (id: string, data: any) => api.put(`/modules/${id}`, data),
  deleteModule: (id: string) => api.delete(`/modules/${id}`),
};

// File API
export const fileService = {
  uploadFile: (formData: FormData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getFileUrl: (id: string) => api.get(`/files/${id}/url`),
  getFilesByModule: (moduleId: string) => api.get(`/files/module/${moduleId}`),
  deleteFile: (id: string) => api.delete(`/files/${id}`),
};

// Contact API
export const contactService = {
  submitContact: (data: any) => api.post('/contact', data),
};

// Health API
export const healthService = {
  checkHealth: () => api.get('/health'),
  checkDatabase: () => api.get('/health/db'),
};

export default api;