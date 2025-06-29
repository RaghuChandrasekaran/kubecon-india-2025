import axios from "axios"

const axiosClient = axios.create();

axiosClient.defaults.headers.common = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

//All request will wait 2 seconds before timeout
axiosClient.defaults.timeout = 2000;

// Add request interceptor to include auth token in all requests
axiosClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Make sure headers object exists
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Use window.ENV (injected at runtime) if available, otherwise fall back to process.env
// This allows us to inject configuration at runtime in Kubernetes
export const productsUrl = (window as any).ENV?.REACT_APP_PRODUCTS_URL_BASE || process.env.REACT_APP_PRODUCTS_URL_BASE
export const cartUrl = (window as any).ENV?.REACT_APP_CART_URL_BASE || process.env.REACT_APP_CART_URL_BASE
export const usersUrl = (window as any).ENV?.REACT_APP_USERS_URL_BASE || process.env.REACT_APP_USERS_URL_BASE
export const searchUrl = (window as any).ENV?.REACT_APP_SEARCH_URL_BASE || process.env.REACT_APP_SEARCH_URL_BASE

export default axiosClient