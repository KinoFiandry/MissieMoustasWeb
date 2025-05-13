// frontend/src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',  // <— utilisez l’hôte et port du backend exposé
  withCredentials: false,
});

// Intercepte requêtes pour ajouter le Bearer token
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
