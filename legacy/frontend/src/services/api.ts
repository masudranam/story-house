import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000', 
  withCredentials: true, 
});

API.interceptors.request.use(cfg =>{
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if(token)cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
})

API.interceptors.response.use(
  res => res,
  error => {
    if (error.response && error.response.status === 500) {
      localStorage.removeItem('token');
      window.location.href = '/users/login'; 
    }
    return Promise.reject(error);
  }
);
export default API;
