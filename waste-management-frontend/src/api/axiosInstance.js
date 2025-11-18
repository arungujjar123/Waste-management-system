import axios from 'axios';

// ✅ Environment variable से base URL
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.data) {
      console.log('📤 Request data:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    console.log('📥 Response data:', response.data);
    return response;
  },
  (error) => {
    const errorDetails = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: `${error.config?.baseURL}${error.config?.url}`,
      method: error.config?.method?.toUpperCase()
    };
    
    console.error('❌ Response Error:', errorDetails);

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.log('🚪 Unauthorized - Clearing auth data and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Handle 404 errors
    if (error.response?.status === 404) {
      console.log('🔍 Resource not found - Check API endpoint');
    }

    // Handle 500 errors
    if (error.response?.status === 500) {
      console.log('🔥 Server error - Check backend logs');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;