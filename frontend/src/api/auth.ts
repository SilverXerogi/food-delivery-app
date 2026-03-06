import apiClient from './client';
import { LoginRequest, LoginResponse, RegisterRequest } from 'shared-types';

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> => 
    apiClient.post('/auth/login', data).then(res => res.data),
  
  register: (data: RegisterRequest): Promise<LoginResponse> => 
    apiClient.post('/auth/register', data).then(res => res.data),
  
  logout: (): Promise<{ message: string }> => 
    apiClient.post('/auth/logout').then(res => res.data),
  
  getCurrentUser: (): Promise<any> => 
    apiClient.get('/auth/me').then(res => res.data),

  refreshToken: (refreshToken: string): Promise<LoginResponse> => 
    apiClient.post('/auth/refresh', { refreshToken }).then(res => res.data),
};