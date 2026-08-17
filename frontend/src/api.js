import axios from 'axios'

// Vercel Backend URL for trends data, Render ML URL for predictions
const API_BASE_URL = import.meta.env.VITE_API_URL;
const ML_BASE_URL = import.meta.env.VITE_ML_URL;

const API = axios.create({ baseURL: API_BASE_URL })
const ML_API = axios.create({ baseURL: ML_BASE_URL })

export const getTrends = (params) => API.get('/trends', { params })
export const getTopTrends = () => API.get('/trends/top')
export const getTrendsByYear = (year) => API.get(`/trends/year/${year}`)
export const searchTrends = (tag) => API.get(`/trends/search/${tag}`)
export const getAnalytics = () => API.get('/analytics')
export const predictCategory = (data) => ML_API.post('/predict', data)
export const getModelBenchmark = () => ML_API.get('/benchmark')
export const getXaiFeatures = () => ML_API.get('/xai/features')
