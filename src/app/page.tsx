// src/app/(public)/browse/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import {
  Bell,
  ChevronRight,
  Circle,
  Compass,
  Gamepad2,
  Headphones,
  Heart,
  Home,
  Music,
  Radio,
  Search,
  Settings,
  ShieldQuestion,
  Sparkles,
  Users,
  Video,
  Zap,
} from 'lucide-react';

import { streamsApi } from '@/lib/api/streams';
import { followsAPI } from '@/lib/api/follows';
import { API_URL } from '@/lib/api/config';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LiveOverview, Stream } from '@/types';
import { Navbar } from '@/components/layout/navbar';
import { ChatButton } from '@/components/chat/ChatButton';

function formatViewers(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [overview, setOverview] = useState<LiveOverview | null>(null);
  const [followingLive, setFollowingLive] = useState<Stream[]>([]);



  const {
    data: initialFollowingLive,
    isLoading: isFollowingLoading,
  } = useQuery({
    queryKey: ['follows', 'live'],
    queryFn: streamsApi.getLiveStreams,
    retry: false,
  });



  useEffect(() => {
    if (initialFollowingLive) {
      setFollowingLive(initialFollowingLive);
    }
  }, [initialFollowingLive]);


  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;

    if (!token) return;

    const controller = new AbortController();

    fetchEventSource(`${API_URL}/follows/events/live`, {
      signal: controller.signal,
      openWhenHidden: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onmessage(event) {
        if (!event.data) return;

        try {
          const parsed = JSON.parse(event.data) as Stream[];
          setFollowingLive(parsed);
        } catch {
          // ignore malformed event
        }
      },
      onerror() {
        // fetch-event-source sẽ tự retry
      },
    });

    return () => controller.abort();
  }, []);

  const filteredStreams = useMemo(() => {
    const streams = overview?.liveStreams ?? [];

    if (!searchQuery.trim()) return streams;

    const q = searchQuery.toLowerCase();

    return streams.filter((stream) => {
      return (
        stream.title.toLowerCase().includes(q) ||
        stream.streamer.username.toLowerCase().includes(q) ||
        stream.streamer.fullName?.toLowerCase().includes(q) ||
        stream.category?.name.toLowerCase().includes(q)
      );
    });
  }, [overview?.liveStreams, searchQuery]);

  const heroStream = overview?.heroStream ?? filteredStreams[0] ?? null;

  return (
    <div className="min-h-screen bg-[#08090d] text-white">
      <div className="flex min-h-screen">
        <BrowseSidebar
          followingLive={followingLive}
          topLiveStreams={overview?.topLiveStreams ?? []}
          isFollowingLoading={isFollowingLoading}
        />

        <main className="min-w-0 flex-1 pl-0 lg:pl-[260px]">
          <Navbar />

          <div className="mx-auto max-w-[1480px] px-4 py-6 md:px-8">

            <>
              <HeroSection stream={heroStream} />

              <SectionHeader
                eyebrow="/"
                title="Recommended For You"
                action="View All"
              />

              {filteredStreams.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {filteredStreams.slice(0, 8).map((stream) => (
                    <StreamCard key={stream.id} stream={stream} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Video className="h-10 w-10" />}
                  title="Không có live stream phù hợp"
                  description={
                    searchQuery
                      ? 'Không tìm thấy stream theo từ khóa bạn nhập.'
                      : 'Hiện chưa có ai đang live. Neon hơi yên tĩnh một chút.'
                  }
                />
              )}

              <SectionHeader
                eyebrow="/"
                title="Top Categories"
                action="Explore More"
                className="mt-10"
              />

              {overview?.liveCategories?.length ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                  {overview.liveCategories.slice(0, 6).map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon={<Gamepad2 className="h-8 w-8" />}
                  title="Chưa có danh mục đang live"
                  description="Khi có stream live thuộc danh mục, khu vực này sẽ tự cập nhật realtime."
                />
              )}

              <SectionHeader
                title="Popular Channels"
                className="mt-10"
              />

              {overview?.popularChannels?.length ? (
                <div className="grid grid-cols-3 gap-6 md:grid-cols-4 lg:grid-cols-6">
                  {overview.popularChannels.map((channel) => (
                    <PopularChannelCard
                      key={channel.id}
                      channel={channel}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  icon={<Users className="h-8 w-8" />}
                  title="Chưa có kênh nổi bật"
                  description="Top kênh sẽ xuất hiện khi có streamer đang live."
                />
              )}
            </>

          </div>
        </main>
        <ChatButton />
      </div>
    </div>
  );
}



export function BrowseSidebar({
  followingLive,
  topLiveStreams,
  isFollowingLoading,
  isLoading,
}: {
  followingLive: Stream[];
  topLiveStreams: Stream[];
  isFollowingLoading: boolean;
  isLoading?: boolean;
}) {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[260px] border-r border-white/5 bg-[#111219] lg:flex lg:flex-col">
      <div className="flex h-16 items-center px-6">
        <Link
          href="/browse"
          className="text-xl font-black italic tracking-tight text-transparent bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text"
        >
          NEON NOIR
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <SidebarNav />

        <SidebarSection title="Channels">
          {isFollowingLoading ? (
            <SidebarSkeleton count={3} />
          ) : followingLive.length > 0 ? (
            followingLive.slice(0, 6).map((stream) => (
              <SidebarStreamItem
                key={stream.id}
                stream={stream}
                subtitle={stream.category?.name ?? 'Live'}
              />
            ))
          ) : (
            <SidebarEmpty text="Chưa có kênh đang follow nào live" />
          )}
        </SidebarSection>

        <SidebarSection title="Recommended">
          {isLoading ? (
            <SidebarSkeleton count={5} />
          ) : topLiveStreams.length > 0 ? (
            topLiveStreams.slice(0, 5).map((stream) => (
              <SidebarStreamItem
                key={stream.id}
                stream={stream}
                subtitle={stream.category?.name ?? 'Live'}
              />
            ))
          ) : (
            <SidebarEmpty text="Chưa có kênh live nổi bật" />
          )}

          <Link
            href="/browse"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-cyan-200"
          >
            Browse More
            <ChevronRight className="h-3 w-3" />
          </Link>
        </SidebarSection>
      </div>

      <div className="border-t border-white/5 p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Link
          href="/support"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
        >
          <ShieldQuestion className="h-4 w-4" />
          Support
        </Link>
      </div>
    </aside>
  );
}

export function SidebarNav() {
  return (
    <div className="mb-5 space-y-1">
      <Link
        href="/"
        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
      >
        <Home className="h-4 w-4" />
        Home
      </Link>
      <Link
        href="/browse"
        className="flex items-center gap-3 rounded-xl bg-violet-500/15 px-3 py-2 text-sm font-semibold text-violet-200"
      >
        <Compass className="h-4 w-4" />
        Browse
      </Link>
      <Link
        href="/following"
        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
      >
        <Heart className="h-4 w-4" />
        Following
      </Link>
    </div>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">
      <h3 className="mb-3 px-3 text-[11px] font-black uppercase tracking-[0.22em] text-zinc-500">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function SidebarStreamItem({
  stream,
  subtitle,
}: {
  stream: Stream;
  subtitle: string;
}) {
  return (
    <Link
      href={`/watch/${stream.id}`}
      className="group flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-white/[0.06]"
    >
      <Avatar className="h-9 w-9 ring-1 ring-white/10">
        <AvatarImage src={stream.streamer.avatar || undefined} />
        <AvatarFallback className="bg-zinc-800 text-xs">
          {stream.streamer.username[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-100 group-hover:text-white">
          {stream.streamer.username}
        </p>
        <p className="truncate text-xs text-zinc-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-1 text-xs text-zinc-400">
        <Circle className="h-2 w-2 fill-rose-500 text-rose-500" />
        {formatViewers(stream.viewerCount)}
      </div>
    </Link>
  );
}

function SidebarSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24 bg-white/10" />
            <Skeleton className="h-3 w-16 bg-white/10" />
          </div>
        </div>
      ))}
    </>
  );
}

function SidebarEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3 text-xs leading-5 text-zinc-500">
      {text}
    </div>
  );
}

function HeroSection({ stream }: { stream: Stream | null }) {
  if (!stream) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-zinc-900 via-[#12141d] to-black p-10 shadow-2xl">
        <div className="max-w-2xl">
          <Badge className="mb-5 bg-white/10 text-zinc-300 hover:bg-white/10">
            <Sparkles className="mr-2 h-3 w-3" />
            NEON NOIR
          </Badge>
          <h1 className="mb-3 text-4xl font-black tracking-tight md:text-5xl">
            Chưa có ai đang live
          </h1>
          <p className="max-w-xl text-zinc-400">
            Khi có stream bắt đầu, hero này sẽ tự động cập nhật realtime bằng SSE.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/watch/${stream.id}`}>
      <section className="group relative min-h-[340px] overflow-hidden rounded-3xl border border-white/5 bg-black shadow-2xl shadow-black/40">
        {stream.thumbnailUrl ? (
          <img
            src={stream.thumbnailUrl}
            alt={stream.title}
            className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.18),transparent_35%)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0%,transparent_35%,rgba(255,255,255,0.03)_70%)]" />

        <div className="relative flex min-h-[340px] items-end p-6 md:p-10">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Badge className="bg-rose-500 text-white hover:bg-rose-500">
                LIVE
              </Badge>
              <span className="text-sm font-semibold text-zinc-300">
                {formatViewers(stream.viewerCount)} Viewers
              </span>
            </div>

            <h1 className="mb-5 max-w-3xl text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl">
              {stream.title}
            </h1>

            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 ring-2 ring-cyan-400">
                <AvatarImage src={stream.streamer.avatar || undefined} />
                <AvatarFallback className="bg-cyan-950 text-cyan-100">
                  {stream.streamer.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-bold text-cyan-300">
                  {stream.streamer.username}
                </p>
                <p className="text-sm text-zinc-400">
                  {stream.category?.name ?? 'Live'} · English
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Link>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action,
  className = '',
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  className?: string;
}) {
  return (
    <div className={`mb-5 mt-9 flex items-center justify-between ${className}`}>
      <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-zinc-100">
        {eyebrow && <span className="text-cyan-300">{eyebrow}</span>}
        {title}
      </h2>

      {action && (
        <button className="text-xs font-bold text-cyan-300 transition hover:text-cyan-200">
          {action}
        </button>
      )}
    </div>
  );
}

function StreamCard({ stream }: { stream: Stream }) {
  return (
    <Link href={`/watch/${stream.id}`}>
      <Card className="group overflow-hidden border-white/5 bg-white/[0.035] text-white transition hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/[0.06]">
        <div className="relative aspect-video overflow-hidden bg-zinc-900">
          {stream.thumbnailUrl ? (
            <img
              src={stream.thumbnailUrl}
              alt={stream.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-950/70 to-cyan-950/40">
              <Video className="h-10 w-10 text-zinc-500" />
            </div>
          )}

          <div className="absolute left-3 top-3">
            <Badge className="bg-rose-500 text-[10px] font-black text-white hover:bg-rose-500">
              LIVE
            </Badge>
          </div>

          <div className="absolute bottom-3 left-3">
            <Badge className="bg-black/70 text-xs text-white backdrop-blur hover:bg-black/70">
              {formatViewers(stream.viewerCount)} Viewers
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={stream.streamer.avatar || undefined} />
              <AvatarFallback className="bg-zinc-800 text-xs">
                {stream.streamer.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-black uppercase leading-snug text-zinc-100 group-hover:text-cyan-200">
                {stream.title}
              </h3>

              <p className="mt-1 truncate text-sm text-zinc-400">
                {stream.streamer.username}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {stream.category?.name && (
                  <Badge className="rounded-md bg-white/10 text-[10px] text-zinc-300 hover:bg-white/10">
                    {stream.category.name}
                  </Badge>
                )}
                <Badge className="rounded-md bg-white/10 text-[10px] text-zinc-300 hover:bg-white/10">
                  English
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CategoryCard({
  category,
}: {
  category: {
    id: string;
    name: string;
    slug: string;
    thumbnailUrl: string | null;
    liveCount: number;
    viewerCount: number;
  };
}) {
  const fallbackIcon =
    category.slug.includes('music') ? (
      <Music className="h-12 w-12" />
    ) : category.slug.includes('chat') ? (
      <Headphones className="h-12 w-12" />
    ) : (
      <Gamepad2 className="h-12 w-12" />
    );

  return (
    <Link href={`/categories/${category.slug}`}>
      <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/5 bg-white/[0.04] transition hover:-translate-y-1 hover:border-cyan-300/40">
        {category.thumbnailUrl ? (
          <img
            src={category.thumbnailUrl}
            alt={category.name}
            className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-violet-950/40 to-cyan-950/30 text-zinc-600">
            {fallbackIcon}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-black text-white">{category.name}</h3>
          <p className="mt-1 text-xs font-bold text-cyan-300">
            {formatViewers(category.viewerCount)} Viewers
          </p>
          <p className="text-[11px] text-zinc-400">
            {category.liveCount} live stream
          </p>
        </div>
      </div>
    </Link>
  );
}

function PopularChannelCard({
  channel,
}: {
  channel: {
    id: string;
    username: string;
    fullName: string | null;
    avatar: string | null;
    viewerCount: number;
    streamId: string;
  };
}) {
  return (
    <Link
      href={`/watch/${channel.streamId}`}
      className="group flex flex-col items-center text-center"
    >
      <div className="relative">
        <Avatar className="h-20 w-20 ring-2 ring-white/10 transition group-hover:ring-cyan-300">
          <AvatarImage src={channel.avatar || undefined} />
          <AvatarFallback className="bg-zinc-800 text-xl font-black">
            {channel.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#08090d] bg-rose-500" />
      </div>

      <p className="mt-3 max-w-full truncate text-sm font-bold text-zinc-200 group-hover:text-cyan-200">
        {channel.username}
      </p>

      <p className="text-xs text-zinc-500">
        {formatViewers(channel.viewerCount)} viewers
      </p>
    </Link>
  );
}

function BrowsePageSkeleton() {
  return (
    <>
      <Skeleton className="h-[340px] rounded-3xl bg-white/10" />

      <div className="mb-5 mt-9 flex items-center justify-between">
        <Skeleton className="h-7 w-64 bg-white/10" />
        <Skeleton className="h-4 w-16 bg-white/10" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card
            key={index}
            className="overflow-hidden border-white/5 bg-white/[0.035]"
          >
            <Skeleton className="aspect-video bg-white/10" />
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full bg-white/10" />
                  <Skeleton className="h-4 w-2/3 bg-white/10" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-5 mt-10 flex items-center justify-between">
        <Skeleton className="h-7 w-48 bg-white/10" />
        <Skeleton className="h-4 w-20 bg-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className="aspect-[4/5] rounded-2xl bg-white/10"
          />
        ))}
      </div>
    </>
  );
}

function EmptyState({
  icon,
  title,
  description,
  compact = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.03] text-center ${compact ? 'py-10' : 'py-20'
        }`}
    >
      <div className="mb-4 rounded-2xl bg-white/5 p-4 text-zinc-500">
        {icon}
      </div>
      <h3 className="text-lg font-black text-zinc-200">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center rounded-3xl border border-rose-500/10 bg-rose-500/[0.04] text-center">
      <Zap className="mb-4 h-12 w-12 text-rose-300" />
      <h3 className="text-xl font-black text-rose-100">
        Không tải được dữ liệu live
      </h3>
      <p className="mt-2 max-w-md text-sm text-rose-200/70">
        Kiểm tra lại backend, endpoint live-overview hoặc kết nối SSE.
      </p>
    </div>
  );
}
