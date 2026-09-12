import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://agriculture-u1me.onrender.com';
const API_URL = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to attach token to requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth Services
export const signup = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

export const updateSettings = async (userData) => {
  const response = await api.put('/auth/settings', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Scan Services
export const analyzeCrop = async (formData) => {
  const response = await api.post('/scans/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Intelligence Services
export const analyzeIntelligence = async (formData) => {
  const response = await api.post('/intelligence/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const askDoubt = async (doubtData) => {
  const response = await api.post('/intelligence/ask-doubt', doubtData);
  return response.data;
};

export const getScans = async () => {
  const response = await api.get('/scans');
  return response.data;
};

export const getCommunityScans = async () => {
  const response = await api.get('/scans/community');
  return response.data;
};

export const getScanById = async (id) => {
  const response = await api.get(`/scans/${id}`);
  return response.data;
};

export const deleteScan = async (id) => {
  const response = await api.delete(`/scans/${id}`);
  return response.data;
};

// Weather Services
export const getWeather = async (lat, lon, city) => {
  try {
    let url = '/weather';
    if (lat && lon) url += `?lat=${lat}&lon=${lon}`;
    else if (city) url += `?city=${city}`;
    
    const res = await api.get(url);
    return res.data;
  } catch (error) {
    console.error('Get weather error:', error);
    throw error;
  }
};

export const askWeatherAssistant = async (message, weather, history) => {
  try {
    const res = await api.post('/weather/assistant', { message, weather, history });
    return res.data;
  } catch (error) {
    console.error('Ask Weather Assistant error:', error);
    throw error;
  }
};

// Post Services
export const createPost = async (postData) => {
  const response = await api.post('/posts', postData);
  return response.data;
};

export const getPosts = async () => {
  const response = await api.get('/posts');
  return response.data;
};

export const addComment = async (postId, commentData) => {
  const response = await api.post(`/posts/${postId}/comments`, commentData);
  return response.data;
};

// ==========================================
// CHATS (AI ASSISTANT)
// ==========================================

export const getChats = async () => {
  const response = await api.get('/chats');
  return response.data;
};

export const getChatById = async (id) => {
  const response = await api.get(`/chats/${id}`);
  return response.data;
};

export const sendChatMessage = async (formData) => {
  const response = await api.post('/chats', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// ==========================================
// AI REPORTS
// ==========================================

export const getAIReports = async () => {
  const response = await api.get('/ai-reports');
  return response.data;
};

export const getAIReportById = async (id) => {
  const response = await api.get(`/ai-reports/${id}`);
  return response.data;
};

export const markReportAsRead = async (id) => {
  const response = await api.post(`/ai-reports/${id}/read`);
  return response.data;
};

// ==========================================
// NOTIFICATIONS
// ==========================================

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.post(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.post('/notifications/read-all');
  return response.data;
};

export default api;
