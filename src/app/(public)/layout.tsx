// src/app/(public)/layout.tsx
'use client';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ChatButton } from '@/components/chat/ChatButton';
import { BrowseSidebar } from '../page';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { followsAPI } from '@/lib/api/follows';
import { LiveOverview, Stream } from '@/types';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [followingLive, setFollowingLive] = useState<Stream[]>([]);
  const {
    data: initialFollowingLive,
    isLoading: isFollowingLoading,
  } = useQuery({
    queryKey: ['follows', 'live'],
    queryFn: followsAPI.getLiveFollowedStreams,
    retry: false,
  });

  useEffect(() => {
    if (initialFollowingLive) {
      setFollowingLive(initialFollowingLive);
    }
  }, [initialFollowingLive]);

  const [overview, setOverview] = useState<LiveOverview | null>(null);

  return (
    <div className="flex min-h-screen flex-col">
      {/* ✅ Navbar nằm trên cùng, full width */}
      <Navbar />

      {/* ✅ Sidebar + Content nằm ngang bên dưới navbar */}
      <div className="flex flex-1 pt-[64px]"> {/* pt bằng chiều cao navbar */}
        <BrowseSidebar
          followingLive={followingLive}
          topLiveStreams={overview?.topLiveStreams ?? []}
          isFollowingLoading={isFollowingLoading}
        />
        <main className="flex-1 h-screen overflow-hidden">
          {children}
        </main>
      </div>

      <ChatButton />
    </div>
  );
}
