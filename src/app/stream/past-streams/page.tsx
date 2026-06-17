'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Eye, EyeOff, PlayCircle, Diamond } from 'lucide-react';
import { useMyStreams, useToggleVisibility } from '@/lib/hooks/useMyStreams';

const statusColor: Record<string, string> = {
  LIVE:       'bg-red-500/20 text-red-400 border border-red-500/30',
  ENDED:      'bg-white/5 text-white/40 border border-white/10',
  IDLE:       'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  PROCESSING: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
};

export default function MyStreamsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyStreams(page);
  const toggleVisibility = useToggleVisibility();

  const totalPages = Math.ceil((data?.total ?? 0) / 10);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-black text-white">Quản lý buổi Live</h1>

      <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#111219] shadow-xl shadow-black/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8">
              {['Tiêu đề', 'Lượt xem', 'Kim cương', 'Trạng thái', 'Hiển thị', 'Thời gian', 'Recording'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-[0.18em] text-white/35">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 animate-pulse rounded-lg bg-white/5" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.data.map((stream) => (
                  <tr key={stream.id} className="transition hover:bg-white/[0.03]">
                    {/* Tiêu đề */}
                    <td className="px-5 py-3.5 font-semibold text-white">{stream.title}</td>

                    {/* Lượt xem */}
                    <td className="px-5 py-3.5 text-white/60">
                      {stream.viewerCount.toLocaleString('vi-VN')}
                    </td>

                    {/* Kim cương */}
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
                        <Diamond className="h-3.5 w-3.5" />
                        {(stream.totalDiamonds ?? 0).toLocaleString('vi-VN')}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${statusColor[stream.status]}`}>
                        {stream.status}
                      </span>
                    </td>

                    {/* Hiển thị */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => toggleVisibility.mutate(stream.id)}
                        className="rounded-lg p-1.5 transition hover:bg-white/8"
                        title={stream.isPublic ? 'Ẩn buổi live' : 'Hiện buổi live'}
                      >
                        {stream.isPublic
                          ? <Eye className="h-4 w-4 text-green-400" />
                          : <EyeOff className="h-4 w-4 text-white/25" />
                        }
                      </button>
                    </td>

                    {/* Thời gian */}
                    <td className="px-5 py-3.5 text-white/35">
                      {formatDistanceToNow(new Date(stream.createdAt), { addSuffix: true, locale: vi })}
                    </td>

                    {/* Recording */}
                    <td className="px-5 py-3.5">
                      {stream.recordingUrl ? (
                        <a
                          href={stream.recordingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 font-semibold text-violet-400 transition hover:text-violet-300"
                        >
                          <PlayCircle className="h-4 w-4" />
                          Xem lại
                        </a>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
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
  );
}
