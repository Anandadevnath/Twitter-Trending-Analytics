import axios from 'axios'

const API = axios.create({ baseURL: '/api' })
const ML_API = axios.create({ baseURL: '/ml' })

export const getTrends = (params) => API.get('/trends', { params })
export const getTopTrends = () => API.get('/trends/top')
export const getTrendsByYear = (year) => API.get(`/trends/year/${year}`)
export const searchTrends = (tag) => API.get(`/trends/search/${tag}`)
export const getAnalytics = () => API.get('/analytics')
export const predictCategory = (data) => ML_API.post('/predict', data)
export const getModelBenchmark = () => ML_API.get('/benchmark')
export const getXaiFeatures = () => ML_API.get('/xai/features')
