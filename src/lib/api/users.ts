import { apiClient } from './client';

export interface PublicProfile {
  id: string;
  username: string;
  fullName: string | null;
  avatar: string | null;
  bio: string | null;
  coverImage: string | null;
  followerCount: number;
  isLive: boolean;
  liveStream: {
    id: string;
    title: string;
    viewerCount: number;
    thumbnailUrl: string | null;
    playbackUrl: string;
  } | null;
  pastStreams: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    recordingUrl: string | null;
    viewerCount: number;
    createdAt: string;
    category: { id: string; name: string } | null;
  }[];
  totalStreams: number;
  createdAt: string;
}

export const usersAPI = {
  getPublicProfile: async (username: string): Promise<PublicProfile> => {
    const profile = await apiClient.get<PublicProfile>(
      `/users/profile/${encodeURIComponent(username)}`
    );

    return profile;
  },
};
