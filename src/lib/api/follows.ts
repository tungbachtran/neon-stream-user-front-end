import { Stream } from '@/types';
import { apiClient } from './client';

export const followsAPI = {
  // ✅ return để có giá trị boolean
  toggleFollow: async (username: string): Promise<boolean> => {
    const res = await apiClient.post<{ isFollowing: boolean }>(`/follows/${username}`);
    return res.isFollowing;
  },

  // ✅ return để có giá trị boolean
  checkFollowStatus: async (username: string): Promise<boolean> => {
    const res = await apiClient.get<{ isFollowing: boolean }>(`/follows/status/${username}`);
    return res.isFollowing;
  },

  getLiveFollowedStreams: async (): Promise<Stream[]> => {
    return apiClient.get<Stream[]>('/follows/live');
  },
};
