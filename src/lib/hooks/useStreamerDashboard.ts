import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client'; 

export interface StreamerStats {
  totalStreams: number;
  totalViewers: number;
  totalDiamonds: number;
  totalFollowers: number;
  totalGiftsReceived: number;
  recentStreams: {
    id: string;
    title: string;
    viewerCount: number;
    createdAt: string;
    status: string;
  }[];
}

export const useStreamerDashboard = () => {
  return useQuery<StreamerStats>({
    queryKey: ['streamer-dashboard'],
    queryFn: () => apiClient.get('/streams/dashboard/stats'),
    refetchInterval: 30000,
  });
};
