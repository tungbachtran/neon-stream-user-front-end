// src/lib/hooks/useFollow.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { followsAPI } from '@/lib/api/follows';
import { usersAPI } from '@/lib/api/users';

// ── Query keys tập trung ──────────────────────────────────────────────
export const followKeys = {
  status: (username: string) => ['follow', 'status', username] as const,
  profile: (username: string) => ['profile', username] as const,
};

// ── Check trạng thái follow ───────────────────────────────────────────
export function useFollowStatus(username: string, enabled = true) {
  return useQuery({
    queryKey: followKeys.status(username),
    queryFn: () => followsAPI.checkFollowStatus(username),
    enabled: enabled && !!username,
    staleTime: 30_000, // 30s — không cần refetch liên tục
  });
}

// ── Toggle follow + invalidate ────────────────────────────────────────
export function useToggleFollow(username: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => followsAPI.toggleFollow(username),

    // Optimistic update — UI phản hồi ngay
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: followKeys.status(username) });

      const prev = queryClient.getQueryData<boolean>(followKeys.status(username));

      // Flip trạng thái ngay lập tức
      queryClient.setQueryData(followKeys.status(username), (old: boolean) => !old);

      return { prev };
    },

    // Nếu lỗi → rollback
    onError: (_err, _vars, context) => {
      if (context?.prev !== undefined) {
        queryClient.setQueryData(followKeys.status(username), context.prev);
      }
    },

    // Sau khi thành công → sync lại từ server
    onSuccess: (nowFollowing) => {
      // Cập nhật đúng giá trị server trả về (không dùng optimistic nữa)
      queryClient.setQueryData(followKeys.status(username), nowFollowing);

      // Invalidate profile để followerCount cập nhật chính xác
      queryClient.invalidateQueries({ queryKey: followKeys.profile(username) });
    },
  });
}
