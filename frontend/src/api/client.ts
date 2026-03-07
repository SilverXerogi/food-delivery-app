import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('auth-storage');
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? '';
    const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh'].some((path) => requestUrl.includes(path));

    if (!originalRequest || status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      const response = await refreshClient.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: nextRefreshToken, user } = response.data as {
        accessToken: string;
        refreshToken: string;
        user?: unknown;
      };

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', nextRefreshToken);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAuthData();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
