import axios from "axios"

const axiosClient = axios.create();

axiosClient.defaults.headers.common = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

//All request will wait 2 seconds before timeout
axiosClient.defaults.timeout = 2000;

// Use window.ENV (injected at runtime) if available, otherwise fall back to process.env
// This allows us to inject configuration at runtime in Kubernetes
export const productsUrl = (window as any).ENV?.REACT_APP_PRODUCTS_URL_BASE || process.env.REACT_APP_PRODUCTS_URL_BASE
export const cartUrl = (window as any).ENV?.REACT_APP_CART_URL_BASE || process.env.REACT_APP_CART_URL_BASE

export default axiosClient