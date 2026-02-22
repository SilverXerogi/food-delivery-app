import apiClient from './client';
import { LoginRequest, LoginResponse, RegisterRequest } from 'shared-types';

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> => 
    apiClient.post('/auth/login', data).then(res => res.data),
  
  register: (data: RegisterRequest): Promise<LoginResponse> => 
    apiClient.post('/auth/register', data).then(res => res.data),
  
  logout: (): Promise<void> => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    return Promise.resolve();
  },
  
  getCurrentUser: (): Promise<any> => 
    apiClient.get('/auth/me').then(res => res.data),
};