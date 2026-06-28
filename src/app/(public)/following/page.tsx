'use client';

import { useState } from 'react';
import { useFollowing } from '@/lib/hooks/useFollowing';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Heart, Radio, Eye } from 'lucide-react';

export default function FollowingPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFollowing(page);
  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  const liveChannels = data?.data.filter((c) => c.isLive && c.liveStream) ?? [];
  const allChannels = data?.data ?? [];

  return (
    <div className="min-h-full bg-[#08090d] text-white">
    <div className="mx-auto max-w-5xl space-y-10 p-6">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Heart className="h-5 w-5 text-pink-400" />
        <h1 className="text-2xl font-black text-white">Kênh đang theo dõi</h1>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-bold text-white/40">
          {data?.total ?? 0}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-10">
          {/* Skeleton kênh */}
          <div>
            <div className="mb-4 h-4 w-32 animate-pulse rounded-lg bg-white/5" />
            <div className="flex gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-14 w-14 animate-pulse rounded-full bg-white/5" />
                  <div className="h-3 w-14 animate-pulse rounded-lg bg-white/5" />
                </div>
              ))}
            </div>
          </div>
          {/* Skeleton live */}
          <div>
            <div className="mb-4 h-4 w-40 animate-pulse rounded-lg bg-white/5" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
          </div>
        </div>
      ) : allChannels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-white/25">
          <Heart className="mb-4 h-14 w-14" />
          <p className="font-semibold">Bạn chưa theo dõi kênh nào</p>
        </div>
      ) : (
        <div className="space-y-10">

          {/* ── Hàng 1: Danh sách kênh (avatar tròn + tên) ── */}
          <section>
            <h2 className="mb-5 text-[11px] font-black uppercase tracking-[0.2em] text-white/35">
              Tất cả kênh
            </h2>

            <div className="flex flex-wrap gap-5">
              {allChannels.map((channel) => (
                <Link
                  key={channel.id}
                  href={`/profile/${channel.username}`}
                  className="group flex flex-col items-center gap-2"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className={`h-14 w-14 overflow-hidden rounded-full ring-2 transition group-hover:ring-violet-400 ${
                      channel.isLive ? 'ring-red-500' : 'ring-white/10'
                    }`}>
                      {channel.avatar ? (
                        <Image
                          src={channel.avatar}
                          alt={channel.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#1e1f2b] text-lg font-black text-white/60">
                          {channel.username[0]?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Live dot */}
                    {channel.isLive && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-[#08090d] bg-red-500" />
                    )}
                  </div>

                  {/* Tên */}
                  <span className="max-w-[72px] truncate text-center text-xs font-semibold text-white/60 transition group-hover:text-white">
                    {channel.username}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* ── Hàng 2: Các stream đang live ── */}
          {liveChannels.length > 0 && (
            <section>
              <div className="mb-5 flex items-center gap-2">
                <Radio className="h-4 w-4 text-red-400" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/35">
                  Đang phát trực tiếp
                </h2>
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-black text-red-400">
                  {liveChannels.length}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {liveChannels.map((channel) => (
                  <Link
                    key={channel.id}
                    href={`/watch/${channel.liveStream!.id}`}
                    className="group overflow-hidden rounded-2xl border border-white/8 bg-[#111219] transition hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      {channel.liveStream!.thumbnailUrl ? (
                        <Image
                          src={channel.liveStream!.thumbnailUrl}
                          alt={channel.liveStream!.title}
                          fill
                          className="object-cover opacity-90 transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.12),transparent_60%)]">
                          <Radio className="h-8 w-8 text-white/20" />
                        </div>
                      )}

                      {/* LIVE badge */}
                      <span className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-black text-white shadow-lg">
                        LIVE
                      </span>

                      {/* Viewer count */}
                      <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                        <Eye className="h-3 w-3" />
                        {channel.liveStream!.viewerCount.toLocaleString('vi-VN')}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex items-center gap-3 p-3">
                      <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-red-500/50">
                        {channel.avatar ? (
                          <Image
                            src={channel.avatar}
                            alt={channel.username}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#1e1f2b] text-xs font-black text-white/60">
                            {channel.username[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-black text-white">
                          {channel.username}
                        </p>
                        <p className="truncate text-[11px] text-white/40">
                          {channel.liveStream!.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
        
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/10 disabled:opacity-30"
          >
            Trước
          </button>
          <span className="text-sm font-semibold text-white/40">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/10 disabled:opacity-30"
          >
            Sau
          </button>
        </div>
      )}
    </div>
    </div>
  );
}
