// src/lib/api/gifts.ts
import { apiClient } from './client';
import { GiftItem, LeaderboardEntry } from '@/types/gift';

export interface SendGiftPayload {
  giftId: string;
  streamId: string;
  quantity: number;
  idempotencyKey: string;
}

export const giftsApi = {
  getCatalog: () => apiClient.get<GiftItem[]>('/gifts/catalog'),

  sendGift: (payload: SendGiftPayload) =>
    apiClient.post<{ transactionId: string; newBalance: number }>(
      '/gifts/send',
      payload,
    ),

  getLeaderboard: (streamId: string, limit = 10) =>
    apiClient.get<LeaderboardEntry[]>(
      `/gifts/leaderboard/${streamId}?limit=${limit}`,
    ),

  getBalance: () => apiClient.get<{ balance: number }>('/gifts/balance'),
};
