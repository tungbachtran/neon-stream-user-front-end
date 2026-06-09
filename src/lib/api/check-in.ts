// src/lib/api/check-in.ts
import { apiClient } from './client';
import { CheckInStatus, CheckInResult } from '@/types/check-in';

export const checkInApi = {
  getStatus: () => apiClient.get<CheckInStatus>('/check-in/status'),
  checkIn: () => apiClient.post<CheckInResult>('/check-in'),
};
