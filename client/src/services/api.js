import axios from 'axios';

// Base API URL maps to the Vite proxy configured in vite.config.js
const API_URL = '/api';

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor to inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper functions for auth
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Helper functions for fields
export const fieldsService = {
  getAll: async () => {
    const response = await api.get('/fields');
    return response.data; // { success, data, message }
  },
  getById: async (id) => {
    const response = await api.get(`/fields/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/fields', data);
    return response.data;
  },
  assign: async (id, agentId) => {
    const response = await api.patch(`/fields/${id}/assign`, { agent_id: agentId });
    return response.data;
  },
  updateStage: async (id, stage) => {
    const response = await api.patch(`/fields/${id}/stage`, { stage });
    return response.data;
  },
  addUpdate: async (id, notes, new_stage) => {
    const response = await api.post(`/fields/${id}/updates`, { notes, new_stage });
    return response.data;
  },
  getUpdates: async (id) => {
    const response = await api.get(`/fields/${id}/updates`);
    return response.data;
  }
};

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  }
};
