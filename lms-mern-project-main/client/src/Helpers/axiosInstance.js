import axios from 'axios';

const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:4000/api/v1';

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})