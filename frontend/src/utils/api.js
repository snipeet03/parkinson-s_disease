import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
})

export const voiceAPI = {
  analyze:    (formData) => api.post('/voice/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: () => api.get('/voice/history'),
}

export const typingAPI = {
  getTestText: () => api.get('/typing/test-text'),
  analyze:     (data) => api.post('/typing/analyze', data),
  getHistory:  () => api.get('/typing/history'),
}

export const predictAPI = {
  predict: (data) => api.post('/predict/', data),
}

export const resultsAPI = {
  getHistory:     () => api.get('/results/history'),
  getResult:      (id) => api.get(`/results/${id}`),
  downloadReport: (id) => api.get(`/results/${id}/report`, { responseType: 'blob' }),
  deleteResult:   (id) => api.delete(`/results/${id}`),
}

export default api
