// src/lib/api/auth.ts
import { apiClient } from './client';
import { User } from '@/types';

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName?: string;
  phone?: string;
}

export interface LoginData {
  identifier: string; // email or phone
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authApi = {
  register: (data: RegisterData) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  login: (data: LoginData) =>{
    console.log(apiClient);
    apiClient.post<AuthResponse>('/auth/login', data)

  },

  logout: () =>
    apiClient.post('/auth/logout'),

  getProfile: () =>
    apiClient.get<User>('/auth/me'),

  refreshToken: () =>
    apiClient.post<{ accessToken: string }>('/auth/refresh'),
};
