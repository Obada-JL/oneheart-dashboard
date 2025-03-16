import axios from 'axios';

// Create a base axios instance with relative URLs
const api = axios.create({
  baseURL: '/api',
});

// Add request interceptor to handle authentication
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

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle certificate errors
    if (error.code === 'ERR_CERT_COMMON_NAME_INVALID' || 
        error.code === 'ERR_NETWORK') {
      console.error('Certificate or network error:', error.message);
      // You could show a user-friendly message here
    }
    
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api; 