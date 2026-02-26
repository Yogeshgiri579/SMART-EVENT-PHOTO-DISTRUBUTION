import api from './client'

export const register = (email, password, name) =>
  api.post('/auth/register', { email, password, name }).then((r) => r.data)

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data)

export const refresh = (refreshToken) =>
  api.post('/auth/refresh', { refreshToken }).then((r) => r.data)

export const me = () => api.get('/auth/me').then((r) => r.data)
