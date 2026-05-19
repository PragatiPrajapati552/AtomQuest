import axios from 'axios';

const PROD_API = 'https://atomquest-uweh.onrender.com/api';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || PROD_API,
  withCredentials: true, // Important for sending/receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
