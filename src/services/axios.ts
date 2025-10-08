// src/services/axios.ts
import axios from 'axios'

const base = import.meta.env.BASE_URL.replace(/\/$/, '') 
const api = axios.create({
  baseURL: `${base}/`,
})

export default api
