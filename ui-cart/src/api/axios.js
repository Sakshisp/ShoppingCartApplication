import axios from 'axios';

// Base URL: proxy to Spring Boot or use full URL
// If you have CRA proxy set to http://localhost:8080, keep baseURL = '/'
// Else use baseURL = 'http://localhost:8080'
const baseURL = '/';

export const axiosPublic = axios.create({ baseURL });

export const createAxiosPrivate = (getAccessToken, onUnauthorized) => {
  const instance = axios.create({ baseURL });

  // attach token
  instance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // handle 401
  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const status = error?.response?.status;
      if (status === 401 && onUnauthorized) onUnauthorized();
      return Promise.reject(error);
    }
  );

  return instance;
};
