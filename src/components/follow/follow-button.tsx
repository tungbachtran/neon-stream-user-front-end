'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { followsAPI } from '@/lib/api/follows';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

interface FollowButtonProps {
  username: string;
  initialFollowing?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  onFollowChange?: (followed: boolean) => void;
}

export function FollowButton({
  username,
  initialFollowing = false,
  variant = 'default',
  size = 'default',
  className = '',
  onFollowChange,
}: FollowButtonProps) {
  const { user } = useSelector(state => state.auth);
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // Fetch trạng thái follow thực tế
  useEffect(() => {
    if (!user || checked) return;
    followsAPI
      .checkFollowStatus(username)
      .then((res) => {
        setIsFollowing(res.isFollowing);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [user, username, checked]);

  const handleClick = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.username === username) return; // Không follow bản thân

    setLoading(true);
    try {
      const res = await followsAPI.toggleFollow(username);
      setIsFollowing(res.followed);
      onFollowChange?.(res.followed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.username === username) return null;

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      onClick={handleClick}
      disabled={loading}
      className={`gap-2 transition-all ${
        isFollowing
          ? 'border-purple-500/50 text-purple-300 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10'
          : 'bg-purple-600 hover:bg-purple-700 text-white'
      } ${className}`}
    >
      {loading ? (
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
