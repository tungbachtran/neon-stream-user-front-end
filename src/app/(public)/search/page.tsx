'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Users, Radio, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { searchAPI, SearchStreamerResult, SearchStreamResult } from '@/lib/api/search';
import { FollowButton } from '@/components/follow/follow-button';

type SearchTab = 'streamers' | 'streams';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') ?? '';

  const [tab, setTab] = useState<SearchTab>('streamers');
  const [streamers, setStreamers] = useState<SearchStreamerResult[]>([]);
  const [streams, setStreams] = useState<SearchStreamResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);

    Promise.all([
      searchAPI.searchStreamers(query),
      searchAPI.searchStreams(query),
    ])
      .then(([s1, s2]) => {
        setStreamers(s1);
        setStreams(s2);
      })
      .finally(() => setLoading(false));
  }, [query]);

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <Search className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg">Nhập từ khóa để tìm kiếm</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Tiêu đề */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          Kết quả tìm kiếm cho &quot;{query}&quot;
        </h1>
        <p className="text-gray-400 text-sm">
          {streamers.length} streamer · {streams.length} stream đang live
        </p>
      </div>

      {/* Các tab */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('streamers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'streamers'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Streamers ({streamers.length})
        </button>
        <button
          onClick={() => setTab('streams')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'streams'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          Streams Live ({streams.length})
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : tab === 'streamers' ? (
        streamers.length === 0 ? (
          <EmptyState message="Không tìm thấy streamer nào" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {streamers.map((s) => (
              <StreamerCard key={s.id} streamer={s} />
            ))}
          </div>
        )
      ) : streams.length === 0 ? (
        <EmptyState message="Không có stream nào đang live với tiêu đề này" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {streams.map((s) => (
            <StreamCard key={s.id} stream={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function StreamerCard({ streamer }: { streamer: SearchStreamerResult }) {
  return (
    <Link href={`/profile/${streamer.username}`}>
      <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl p-4 flex items-center gap-4 transition-all group cursor-pointer">
        <div className="relative shrink-0">
          <Avatar className="w-14 h-14">
            <AvatarImage src={streamer.avatar ?? undefined} />
            <AvatarFallback className="bg-purple-600 text-lg">
              {streamer.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {streamer.isLive && (
            <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#0f0f1a]">
              ĐANG PHÁT
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
            {streamer.username}
          </div>
          {streamer.fullName && (
            <div className="text-sm text-gray-400 truncate">{streamer.fullName}</div>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>{streamer.followerCount.toLocaleString()} người theo dõi</span>
            {streamer.isLive && (
              <span className="flex items-center gap-1 text-red-400">
                <Eye className="w-3 h-3" />
                {streamer.viewerCount.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function StreamCard({ stream }: { stream: SearchStreamResult }) {
  return (
    <Link href={`/watch/${stream.id}`}>
      <div className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 rounded-xl overflow-hidden transition-all group cursor-pointer">
        {/* Hình thu nhỏ */}
        <div className="relative aspect-video bg-black/40">
          {stream.thumbnailUrl ? (
            <img
              src={stream.thumbnailUrl}
              alt={stream.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Radio className="w-8 h-8 text-gray-600" />
            </div>
          )}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            ĐANG PHÁT
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {stream.viewerCount.toLocaleString()}
          </div>
        </div>

        {/* Thông tin */}
        <div className="p-3">
          <div className="font-medium text-white text-sm truncate group-hover:text-purple-300 transition-colors">
            {stream.title}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="w-5 h-5">
              <AvatarImage src={stream.streamer.avatar ?? undefined} />
              <AvatarFallback className="bg-purple-600 text-[10px]">
                {stream.streamer.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-400">{stream.streamer.username}</span>
            {stream.category && (
              <Badge variant="secondary" className="text-[10px] ml-auto bg-white/10 text-gray-300 border-0">
                {stream.category.name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Search className="w-12 h-12 mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24 text-gray-400">Đang tải...</div>}>
      <SearchResults />
    </Suspense>
  );
}
