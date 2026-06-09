/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiError } from '@/types';
import { API_BASE_URL } from './config';

const API_URL = API_BASE_URL;

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private onUnauthorized?: () => void;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('access_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => {
        const body = response.data;

        // Shape 1 — Wrapped: { success: true, data: { ... } }
        // Chỉ unwrap khi nested `data` key tồn tại
        if (body?.success !== undefined && body?.data !== undefined) {
          return body.data;
        }

        // Shape 2 — Flat: { success: true, txnId: ..., duplicate: ... }
        // hoặc bất kỳ response nào không có nested data
        return body;
      },
      async (error: AxiosError<ApiError>) => {
        const originalRequest: any = error.config;

        const isAuthRoute =
          originalRequest?.url === '/auth/refresh' ||
          originalRequest?.url === '/auth/login' ||
          originalRequest?.url === '/auth/register';

        if (
          error.response?.status === 401 &&
          !this.isRefreshing &&
          !isAuthRoute &&
          !originalRequest?._retry
        ) {
          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.client.post('/auth/refresh');
            this.isRefreshing = false;
            return this.client.request(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;

            if (typeof window !== 'undefined') {
              localStorage.removeItem('access_token');
            }

            this.onUnauthorized?.();
            return Promise.reject(refreshError);
          }
        }

        if (error.response?.status === 401 && !isAuthRoute) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
          }
          this.onUnauthorized?.();
        }

        const apiError: ApiError = error.response?.data || {
          statusCode: 500,
          message: 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
          path: error.config?.url || '',
        };

        return Promise.reject(apiError);
      }
    );
  }

  public get<T>(url: string, config?: any): Promise<T> {
    return this.client.get(url, config);
  }

  public post<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.post(url, data, config);
  }

  public put<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.client.put(url, data, config);
  }

  public delete<T>(url: string, config?: any): Promise<T> {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient();
