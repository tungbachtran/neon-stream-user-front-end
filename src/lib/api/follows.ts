import { apiClient } from './client';

export const followsAPI = {
  toggleFollow: async (username: string) => {
    const res = await apiClient.post(`/follows/${username}`);
    return res.data as { followed: boolean; message: string };
  },

  checkFollowStatus: async (username: string) => {
    const res = await apiClient.get(`/follows/status/${username}`);
    return res.data as { isFollowing: boolean };
  },

  getLiveFollowedStreams: async () => {
    const res = await apiClient.get('/follows/events/live');
    return res.data;
  },
};
