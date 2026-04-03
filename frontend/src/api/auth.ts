import type { LoginRequest, LoginResponse, RegisterRequest, User } from 'shared-types';
import apiClient from './client';

export const authApi = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>('/auth/login', data).then((res) => res.data),

  register: (data: RegisterRequest): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>('/auth/register', data).then((res) => res.data),

  logout: (): Promise<{ message: string }> =>
    apiClient.post<{ message: string }>('/auth/logout').then((res) => res.data),

  getCurrentUser: (): Promise<User> =>
    apiClient.get<User>('/auth/me').then((res) => res.data),

  refreshToken: (refreshToken: string): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>('/auth/refresh', { refreshToken }).then((res) => res.data),
};
