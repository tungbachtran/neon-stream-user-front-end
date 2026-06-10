// src/lib/api/client.ts
import axios, { AxiosError, AxiosInstance } from "axios";
import { ApiError } from "@/types";
import { API_BASE_URL } from "./config";

type FailedQueueItem = {
  resolve: (token: string) => void;
  reject: (error: any) => void;
};

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: FailedQueueItem[] = [];
  private onUnauthorized?: () => void;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: false, // ✅ Không dùng cookie nữa
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  public setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((item) => {
      if (error) item.reject(error);
      else item.resolve(token!);
    });
    this.failedQueue = [];
  }

  private setupInterceptors() {
    // ── Request: gắn token từ localStorage ─────────────────────────────
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("access_token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ── Response: unwrap + auto-refresh ────────────────────────────────
    this.client.interceptors.response.use(
      (response) => {
        const body = response.data;
        if (body?.success !== undefined && body?.data !== undefined) {
          return body.data;
        }
        return body;
      },
      async (error: AxiosError<ApiError>) => {
        const originalRequest: any = error.config;

        const isAuthRoute =
          originalRequest?.url?.includes("/auth/refresh") ||
          originalRequest?.url?.includes("/auth/login") ||
          originalRequest?.url?.includes("/auth/register");

        if (
          error.response?.status === 401 &&
          !isAuthRoute &&
          !originalRequest?._retry
        ) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((newToken) => {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return this.client.request(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const res = await this.client.post<{ accessToken: string }>(
              "/auth/refresh"
            );
            const newToken = (res as any).accessToken;

            if (newToken && typeof window !== "undefined") {
              localStorage.setItem("access_token", newToken);
            }

            this.processQueue(null, newToken);
            this.isRefreshing = false;

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client.request(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.isRefreshing = false;

            if (typeof window !== "undefined") {
              localStorage.removeItem("access_token");
            }

            this.onUnauthorized?.();
            return Promise.reject(refreshError);
          }
        }

        if (error.response?.status === 401 && isAuthRoute) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
          }
          this.onUnauthorized?.();
        }

        const apiError: ApiError = error.response?.data || {
          statusCode: 500,
          message: "An unexpected error occurred",
          timestamp: new Date().toISOString(),
          path: error.config?.url || "",
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
