// src/components/follow/follow-button.tsx
'use client';

import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useFollowStatus, useToggleFollow } from '@/lib/hooks/useFollow';

interface FollowButtonProps {
  username: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function FollowButton({
  username,
  variant = 'default',
  size = 'default',
  className = '',
}: FollowButtonProps) {
  const { user } = useSelector((state: any) => state.auth);
  const router = useRouter();

  const isSelf = user?.username === username;

  // ✅ Chỉ fetch khi đã login và không phải bản thân
  const { data: isFollowing = false } = useFollowStatus(username, !!user && !isSelf);
  const { mutate: toggle, isPending } = useToggleFollow(username);

  if (isSelf) return null;

  const handleClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    toggle();
  };

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleClick}
      disabled={isPending}
      className={`gap-2 transition-all ${
        isFollowing
          ? 'border-purple-500/50 text-purple-300 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10'
          : 'bg-purple-600 hover:bg-purple-700 text-white'
      } ${className}`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <UserCheck className="w-4 h-4" />
      ) : (
        <UserPlus className="w-4 h-4" />
      )}
      {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
    </Button>
  );
}
