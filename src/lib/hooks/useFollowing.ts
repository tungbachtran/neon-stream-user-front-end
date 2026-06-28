import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";

export interface FollowingChannel {
  id: string;
  username: string;
  avatar?: string;
  isLive: boolean;
  liveStream: {
    id: string;
    title: string;
    viewerCount: number;
    thumbnailUrl?: string;
  } | null;
  followedAt: string;
}

export const useFollowing = (page: number) => {
  return useQuery<{ data: FollowingChannel[]; total: number }>({
    queryKey: ["following", page],
    queryFn: async () =>
      apiClient.get(`/follows/following?page=${page}&limit=20`),
    refetchInterval: 10000, // refresh mỗi 10s để cập nhật live status
  });
};
