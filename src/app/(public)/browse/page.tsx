// src/app/(public)/browse/page.tsx (sửa toàn bộ)
'use client';

import { useRef, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Circle,
  Compass,
  Heart,
  Home,
  Search,
  Video,
} from 'lucide-react';

import { useCategoriesWithStreams } from '@/lib/hooks/use-streams';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Stream } from '@/types';

function formatViewers(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: categoriesWithStreams, isLoading, error } = useCategoriesWithStreams();

  const filteredCategories = useMemo(() => {
    if (!categoriesWithStreams) return [];

    if (!searchQuery.trim()) return categoriesWithStreams;

    const q = searchQuery.toLowerCase();
    return categoriesWithStreams.filter((item) => {
      const categoryMatch = item.category.name.toLowerCase().includes(q);
      const streamMatch = item.streams.some(
        (stream) =>
          stream.title.toLowerCase().includes(q) ||
          stream.streamer.username.toLowerCase().includes(q),
      );
      return categoryMatch || streamMatch;
    });
  }, [categoriesWithStreams, searchQuery]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#08090d] text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Video className="mx-auto mb-4 h-12 w-12 text-white/25" />
            <h1 className="text-xl font-black text-white">
              Không tải được dữ liệu
            </h1>
            <p className="mt-2 text-sm text-white/45">
              Vui lòng thử lại sau.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090d] text-white">
      <TopNav searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="mx-auto max-w-[1480px] px-4 py-8 md:px-8">
        {isLoading ? (
          <div className="space-y-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <CategorySectionSkeleton key={i} />
            ))}
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="space-y-12">
            {filteredCategories.map((item) => (
              <CategorySection
                key={item.category.id}
                category={item.category}
                streams={item.streams}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.03] py-20 text-center">
            <div className="mb-4 rounded-2xl bg-white/5 p-4 text-zinc-500">
              <Video className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-black text-zinc-200">
              Không tìm thấy kết quả
            </h3>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Không có category hoặc stream nào phù hợp với tìm kiếm của bạn.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function TopNav({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#08090d]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-4 px-4 md:px-8">
        <div className="hidden items-center gap-6 lg:flex">
          <Link
            href="/browse"
            className="text-sm font-semibold text-violet-300"
          >
            Duyệt
          </Link>
          <Link
            href="/following"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Đang Theo Dõi
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm kiếm danh mục hoặc stream..."
            className="h-10 rounded-xl border-white/10 bg-white/[0.06] pl-11 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-violet-500"
          />
        </div>

        <Button
          size="sm"
          className="rounded-xl bg-violet-500 px-5 font-bold text-white hover:bg-violet-400"
          asChild
        >
          <Link href="/dashboard/streams">Phát Sóng</Link>
        </Button>

        <button className="hidden rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white md:inline-flex">
          <Bell className="h-5 w-5" />
        </button>

        <Avatar className="h-9 w-9 ring-2 ring-cyan-400/50">
          <AvatarImage src="" />
          <AvatarFallback className="bg-cyan-950 text-cyan-200">
            N
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

function CategorySection({
  category,
  streams,
}: {
  category: any;
  streams: Stream[];
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <Link href={`/categories/${category.slug}`} className="group">
          <h2 className="text-xl font-black uppercase tracking-tight text-zinc-100 transition group-hover:text-cyan-300">
            {category.name}
          </h2>
        </Link>
        <Link
          href={`/categories/${category.slug}`}
          className="text-xs font-bold text-cyan-300 transition hover:text-cyan-200"
        >
          Xem Tất Cả →
        </Link>
      </div>

      <div className="relative">
        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-hide"
        >
          {streams.map((stream) => (
            <div key={stream.id} className="flex-shrink-0 w-[280px]">
              <StreamCard stream={stream} />
            </div>
          ))}
        </div>

        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4 rounded-full bg-black/60 p-2 text-white backdrop-blur transition hover:bg-black/80"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 rounded-full bg-black/60 p-2 text-white backdrop-blur transition hover:bg-black/80"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </section>
  );
}

function StreamCard({ stream }: { stream: Stream }) {
  return (
    <Link href={`/watch/${stream.id}`}>
      <Card className="group h-full overflow-hidden border-white/5 bg-white/[0.035] text-white transition hover:-translate-y-1 hover:border-violet-400/40 hover:bg-white/[0.06]">
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
              ĐANG PHÁT
            </Badge>
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-1">
            <Circle className="h-2 w-2 fill-rose-500 text-rose-500" />
            <Badge className="bg-black/70 text-xs text-white backdrop-blur hover:bg-black/70">
              {formatViewers(stream.viewerCount)}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={stream.streamer.avatar || undefined} />
              <AvatarFallback className="bg-zinc-800 text-xs">
                {stream.streamer.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-sm font-black uppercase leading-snug text-zinc-100 group-hover:text-cyan-200">
                {stream.title}
              </h3>

              <p className="mt-1 truncate text-xs text-zinc-400">
                {stream.streamer.username}
              </p>

              <p className="mt-1 truncate text-xs text-zinc-500">
                {stream.category?.name ?? 'Live'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CategorySectionSkeleton() {
  return (
    <section>
      <Skeleton className="h-7 w-48 mb-5 bg-white/10" />
      <div className="flex gap-5 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[280px]">
            <Card className="overflow-hidden border-white/5 bg-white/[0.035]">
              <Skeleton className="aspect-video bg-white/10" />
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-9 w-9 rounded-full bg-white/10 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full bg-white/10" />
                    <Skeleton className="h-3 w-2/3 bg-white/10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
