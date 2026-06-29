import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})
api.interceptors.request.use((config) => {
  try {
    const storage = localStorage.getItem('chacinpos-storage')
    if (storage) {
      const parsed = JSON.parse(storage)
      const token = parsed?.state?.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
        console.log('Token enviado:', token.substring(0, 20) + '...')
      }
    }
  } catch (e) {
    console.error('Error leyendo token:', e)
  }
  return config
})

// Interceptor — maneja errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('chacinpos-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api