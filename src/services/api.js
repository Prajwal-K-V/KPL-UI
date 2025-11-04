/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://kpl-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
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
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  logout: () => 
    api.post('/auth/logout'),
  
  verifyToken: () => 
    api.get('/auth/verify'),
};

// Teams API
export const teamsAPI = {
  getAll: () => 
    api.get('/teams'),
  
  getById: (id) => 
    api.get(`/teams/${id}`),
  
  getHierarchy: (id) => 
    api.get(`/teams/${id}/hierarchy`),
  
  create: (teamData) => 
    api.post('/teams', teamData),
  
  update: (id, teamData) => 
    api.put(`/teams/${id}`, teamData),
  
  delete: (id) => 
    api.delete(`/teams/${id}`),
};

// Players API
export const playersAPI = {
  getAll: () => 
    api.get('/players'),
  
  getGlobal: () => 
    api.get('/players/global'),
  
  getById: (id) => 
    api.get(`/players/${id}`),
  
  create: (playerData) => 
    api.post('/players', playerData),
  
  update: (id, playerData) => 
    api.put(`/players/${id}`, playerData),
  
  assignToTeam: (id, teamId) => 
    api.put(`/players/${id}/assign`, { team_id: teamId }),
  
  unassignFromTeam: (id) => 
    api.put(`/players/${id}/unassign`),
  
  delete: (id) => 
    api.delete(`/players/${id}`),
  
  search: (query) => 
    api.get('/players/search', { params: { q: query } }),
};

export default api;

