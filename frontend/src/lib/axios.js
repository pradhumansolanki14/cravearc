/**
 * Pre-configured Axios instance
 *
 * Uses the same base URL as StoreContext so the app has a
 * single source of truth for HTTP configuration.
 *
 * Features:
 *  - Base URL from environment variable or fallback to localhost
 *  - Request interceptor: auto-attaches token from localStorage
 *  - Response interceptor: surfaces error messages cleanly
 *
 * Usage:
 *   import api from '@/lib/axios'
 *   const res = await api.get('/api/food/list')
 *   const res = await api.post('/api/cart/add', { itemId })
 */
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

// ── Request interceptor: attach auth token ─────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.token = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: normalize errors ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

export default api
export { BASE_URL }
