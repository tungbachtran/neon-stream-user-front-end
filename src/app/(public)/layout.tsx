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
    <>
      <div className='flex min-h-screen'>
      <BrowseSidebar
          followingLive={followingLive}
          topLiveStreams={overview?.topLiveStreams ?? []}
          isFollowingLoading={isFollowingLoading}
        />
      <main className="min-w-0 flex-1 pl-0 lg:pl-[260px]">
      <Navbar />
        {children}
        </main>
     
      <ChatButton />
      </div>

    </>
  );
}
