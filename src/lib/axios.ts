import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('superadmin_token');
      localStorage.removeItem('token'); // jika ada token user guru

      // Lempar kembali ke halaman login utama
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);