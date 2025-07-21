import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    if (response.data?.success === false) {
      return Promise.reject(response.data);
    }
    return response.data;
  },
  (error) => {
    // Handle errors
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'An error occurred';
    
    // Show error toast
    if (errorMessage !== 'Unauthorized' && !error.config?.skipErrorToast) {
      toast.error(errorMessage);
    }

    // Handle unauthorized errors
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// File API methods
export const fileApi = {
  // Get all files for current user
  getFiles: () => api.get('/files'),
  
  // Upload a file
  uploadFile: (formData, onUploadProgress) => {
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          onUploadProgress(progress);
        }
      },
    });
  },
  
  // View/Download a file
  viewFile: (fileId) => {
    return api.get(`/files/view/${fileId}`, {
      responseType: 'blob',
      skipErrorToast: true,
    });
  },
  
  // Delete a file
  deleteFile: (fileId) => {
    return api.delete(`/files/${fileId}`);
  },
};

export default api;