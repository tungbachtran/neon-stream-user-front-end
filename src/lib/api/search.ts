import { apiClient } from './client';

export interface SearchStreamerResult {
  id: string;
  username: string;
  fullName: string | null;
  avatar: string | null;
  isLive: boolean;
  viewerCount: number;
  followerCount: number;
}

export interface SearchStreamResult {
  id: string;
  title: string;
  status: string;
  viewerCount: number;
  thumbnailUrl: string | null;
  playbackUrl: string;
  streamer: {
    id: string;
    username: string;
    fullName: string | null;
    avatar: string | null;
  };
  category: { id: string; name: string } | null;
}

export const searchAPI = {
  searchStreamers: async (query: string): Promise<SearchStreamerResult[]> => {
    const res = await apiClient.get('/streams/search', {
      params: { q: query, type: 'streamer' },
    });
    return res.data?.streamers ?? [];
  },

  searchStreams: async (query: string): Promise<SearchStreamResult[]> => {
    const res = await apiClient.get('/streams/search', {
      params: { q: query, type: 'stream' },
    });
    return res.data?.streams ?? [];
  },

  getSuggestions: async (query: string): Promise<SearchStreamerResult[]> => {
    const res = await apiClient.get('/streams/search/suggestions', {
      params: { q: query },
    });
    return res.data?.streamers ?? [];
  },
};
