// src/hooks/use-past-stream.ts
import { useQuery } from '@tanstack/react-query';
import { streamsApi } from '@/lib/api/streams';

export function usePastStream(streamId: string) {
  return useQuery({
    queryKey: ['past-stream', streamId],
    queryFn: () => streamsApi.getPastStream(streamId),
    enabled: !!streamId,
  });
}