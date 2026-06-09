// src/app/(public)/watch/[id]/page.tsx
'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { streamsApi } from '@/lib/api/streams';
import { useAuth } from '@/lib/hooks/use-auth';
import { StreamPlayer } from '@/components/stream/stream-player';
import { StreamChat } from '@/components/stream/stream-chat';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Eye,
  Heart,
  Share2,
  Tag,
  Video,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { GiftAnimationOverlay } from '@/components/gifts/gift-animation-overlay';
import { GiftTriggerButton } from '@/components/gifts/gift-trigger-button';
import { DonateAlertOverlay } from '@/components/donate/donate-alert-overlay';
import { FollowButton } from '@/components/follow/follow-button';

export default function WatchPage() {
  const params = useParams();
  const { user } = useAuth();
  const streamId = params.id as string;

  const { data: stream, isLoading } = useQuery({
    queryKey: ['streams', streamId],
    queryFn: () => streamsApi.getStreamById(streamId),
    refetchInterval: 5000,
  });

  useQuery({
    queryKey: ['streams', streamId, 'playback'],
    queryFn: () => streamsApi.getStreamCredentials(streamId),
    enabled: !!stream && stream.status === 'LIVE',
  });

  useEffect(() => {
    if (stream?.status === 'LIVE') {
      streamsApi.joinStream(streamId).catch(console.error);

      return () => {
        streamsApi.leaveStream(streamId).catch(console.error);
      };
    }
  }, [streamId, stream?.status]);

  if (isLoading) {
    return <WatchPageSkeleton />;
  }

  if (!stream) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d10] text-white">
        <div className="text-center">
          <Video className="mx-auto mb-4 h-16 w-16 text-white/35" />
          <h2 className="mb-2 text-2xl font-black">Stream not found</h2>
          <p className="mb-4 text-white/50">
            This stream may have ended or been removed
          </p>
          <Link href="/browse">
            <Button className="rounded-xl bg-[#8b6cff] font-bold text-white hover:bg-[#9a7dff]">
              Browse Live Streams
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLive = stream.status === 'LIVE';
  const isEnded = stream.status === 'ENDED';

  return (
    <div className="min-h-screen bg-[#0d0d10] text-white">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_400px]">
        <main className="min-w-0 px-4 py-4 lg:px-6 lg:py-7">
          <section className="overflow-hidden rounded-xl bg-black shadow-2xl shadow-black/40">
            {isLive ? (
              <div className="relative">
                <StreamPlayer url={stream.playbackUrl} />

                <DonateAlertOverlay roomId={streamId} />
                <GiftAnimationOverlay streamId={streamId} />

                <div className="absolute bottom-4 right-4 z-50">
                  <GiftTriggerButton streamId={streamId} />
                </div>

                <div className="absolute left-4 top-4 flex items-center gap-3">
                  <Badge className="rounded-full bg-pink-500 px-3 py-1 text-xs font-black uppercase text-white hover:bg-pink-500">
                    <span className="mr-2 h-2 w-2 rounded-full bg-white" />
                    Live
                  </Badge>

                  <Badge className="rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur hover:bg-black/70">
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    {formatCompact(stream.viewerCount)}
                  </Badge>
                </div>
              </div>
            ) : isEnded && stream.recordingUrl ? (
              <video
                src={stream.recordingUrl}
                controls
                className="aspect-video w-full bg-black"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-violet-500/20 to-pink-500/10">
                <div className="text-center">
                  <Video className="mx-auto mb-4 h-16 w-16 text-white/35" />
                  <p className="mb-2 text-xl font-black">
                    {isEnded ? 'Stream Ended' : 'Stream Offline'}
                  </p>
                  <p className="text-white/45">
                    {isEnded
                      ? 'This stream has ended'
                      : 'This stream is not currently live'}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="mt-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex items-start gap-4">
                  <div className="hidden h-full w-1 rounded-full bg-[#8b6cff] sm:block" />

                  <div>
                    <h1 className="max-w-[640px] text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
                      {stream.title}
                    </h1>

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <Link href={`/profile/${stream.streamer.username}`}>
                        <span className="font-bold text-cyan-400 hover:text-cyan-300">
                          {stream.streamer.username}
                        </span>
                      </Link>

                      <span className="h-1 w-1 rounded-full bg-white/25" />

                      <span className="text-sm font-semibold text-white/45">
                        {formatCompact(stream.viewerCount)} followers
                      </span>

                      {stream.startedAt && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-white/25" />
                          <span className="flex items-center gap-1.5 text-sm text-white/45">
                            <Calendar className="h-3.5 w-3.5" />
                            {isLive
                              ? `Started ${formatDistanceToNow(
                                new Date(stream.startedAt),
                                { addSuffix: true }
                              )}`
                              : `Streamed ${formatDistanceToNow(
                                new Date(stream.startedAt),
                                { addSuffix: true }
                              )}`}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Pill>Competitive</Pill>
                      <Pill>English</Pill>
                      <Pill accent>Drops Enabled</Pill>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-3">
              <FollowButton
    username={stream?.streamer?.username ?? ''}
    size="sm"
  />

                <Button className="h-12 rounded-xl bg-[#25252d] px-8 text-base font-black text-white/75 hover:bg-[#30303a]">
                  <Tag className="mr-2 h-5 w-5 text-pink-400" />
                  Subscribe
                </Button>

                <Button
                  size="icon"
                  className="h-12 w-12 rounded-xl bg-[#25252d] text-white/70 hover:bg-[#30303a]"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Link href={`/profile/${stream.streamer.username}`}>
              <div className="mt-7 flex max-w-[720px] items-center gap-4 rounded-2xl bg-[#16161b] p-4 transition hover:bg-[#1d1d24]">
                <Avatar className="h-12 w-12 ring-2 ring-violet-400/40">
                  <AvatarImage src={stream.streamer.avatar || undefined} />
                  <AvatarFallback className="bg-[#8b6cff] font-black text-white">
                    {stream.streamer.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-white">
                    {stream.streamer.fullName || stream.streamer.username}
                  </p>
                  <p className="truncate text-sm text-white/40">
                    @{stream.streamer.username}
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="rounded-xl border-white/10 bg-transparent font-bold text-white/70 hover:bg-white/5 hover:text-white"
                >
                  View Profile
                </Button>
              </div>
            </Link>

            <div className="mt-8 max-w-[760px] rounded-2xl bg-[#1a1a20] p-6 shadow-xl shadow-black/10">
              <h3 className="mb-4 text-xl font-black text-white">
                About the Stream
              </h3>

              <p className="text-sm leading-7 text-white/55">
                {stream.description ||
                  'Welcome to the global championship finals! Today we determine who takes home the trophy. Join NeonViper as he breaks down the tactics, showcases high-level gameplay, and interacts with the community. Don’t forget to use code NEON for 20% off at the shop!'}
              </p>
            </div>
          </section>
        </main>

        <aside className="hidden lg:block">
          {stream.isChatEnabled && isLive ? (
            <StreamChat roomId={streamId} />
          ) : (
            <div className="h-[calc(100vh-32px)] min-h-[720px] border-l border-white/5 bg-[#111114] p-6">
              <Card className="border-white/10 bg-[#1a1a20] text-white">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Eye className="mb-4 h-12 w-12 text-white/35" />
                  <p className="text-center text-white/45">
                    {stream.isChatEnabled
                      ? 'Chat will be available when stream is live'
                      : 'Chat is disabled for this stream'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </aside>

        <aside className="block px-4 pb-6 lg:hidden">
          {stream.isChatEnabled && isLive && <StreamChat roomId={streamId} />}
        </aside>
      </div>
    </div>
  );
}

function Pill({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#282830] px-4 py-1.5 text-xs font-black uppercase tracking-wide text-white/55">
      {accent && <span className="mr-2 h-2.5 w-2.5 rounded-full bg-cyan-400" />}
      {children}
    </span>
  );
}

function formatCompact(value?: number) {
  const number = value || 0;

  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1)}M`;
  }

  if (number >= 1_000) {
    return `${(number / 1_000).toFixed(1)}K`;
  }

  return String(number);
}

function WatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#0d0d10] text-white">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_400px]">
        <main className="px-4 py-4 lg:px-6 lg:py-7">
          <Skeleton className="aspect-video rounded-xl bg-white/10" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-10 w-3/4 bg-white/10" />
            <Skeleton className="h-5 w-1/2 bg-white/10" />
            <Skeleton className="h-32 w-full max-w-[760px] rounded-2xl bg-white/10" />
          </div>
        </main>

        <aside className="hidden border-l border-white/5 bg-[#111114] p-5 lg:block">
          <Skeleton className="h-[calc(100vh-72px)] min-h-[680px] bg-white/10" />
        </aside>
      </div>
    </div>
  );
}
