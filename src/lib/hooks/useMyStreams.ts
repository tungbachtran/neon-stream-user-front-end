import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client'; 
import { toast } from 'sonner';

export interface MyStream {
  id: string;
  title: string;
  viewerCount: number;
  isPublic: boolean;
  status: string;
  createdAt: string;
  recordingUrl?: string;
  totalDiamonds?: number;
}

export const useMyStreams = (page: number) => {
  return useQuery<{ data: MyStream[]; total: number }>({
    queryKey: ['my-past-streams', page],
    queryFn:  () => apiClient.get(`/streams/my-past-streams?page=${page}&limit=10`)
  });
};

export const useToggleVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:  (streamId: string) => apiClient.patch(`/streams/${streamId}/toggle-visibility`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-past-streams'] });
      toast.success('Đã cập nhật trạng thái hiển thị');
    },
    onError: () => toast.error('Cập nhật thất bại'),
  });
};
