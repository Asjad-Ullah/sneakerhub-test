import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies/authentication
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

// Helper function to get the full API URL for fetch calls
export const getApiUrl = (endpoint) => {
  return `${API_URL}${endpoint}`;
};