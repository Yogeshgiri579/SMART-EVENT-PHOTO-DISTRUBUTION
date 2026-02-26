import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  
  // Don't override Content-Type for FormData (multipart/form-data needs boundary)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refreshToken')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken: refresh })
          localStorage.setItem('accessToken', data.accessToken)
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return api(original)
        } catch (refreshErr) {
          console.error('Token refresh failed:', refreshErr)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return Promise.reject(refreshErr)
        }
      } else {
        // No refresh token, redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export default api
