'use client';

import { useStreamerDashboard } from '@/lib/hooks/useStreamerDashboard';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const statusColor: Record<string, string> = {
  LIVE: 'bg-red-500/20 text-red-400 border border-red-500/30',
  ENDED: 'bg-white/5 text-white/40 border border-white/10',
  IDLE: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  PROCESSING: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
};

const StatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) => (
  <div className="rounded-2xl border border-white/8 bg-[#111219] p-5 shadow-xl shadow-black/20">
    <p className={`text-xs font-black uppercase tracking-[0.18em] ${accent}`}>{label}</p>
    <p className="mt-3 text-3xl font-black text-white">
      {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
    </p>
  </div>
);

export default function StreamerDashboardPage() {
  const { data, isLoading } = useStreamerDashboard();

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-white/5" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-black text-white">Dashboard của tôi</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Tổng buổi live"   value={data?.totalStreams ?? 0}        accent="text-violet-400" />
        <StatCard label="Tổng lượt xem"    value={data?.totalViewers ?? 0}        accent="text-cyan-400"   />
        <StatCard label="Kim cương nhận"   value={data?.totalDiamonds ?? 0}       accent="text-yellow-400" />
        <StatCard label="Followers"        value={data?.totalFollowers ?? 0}      accent="text-green-400"  />
        <StatCard label="Quà đã nhận"      value={data?.totalGiftsReceived ?? 0}  accent="text-pink-400"   />
      </div>

      {/* Recent Streams */}
      <div>
        <h2 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white/40">
          5 buổi live gần nhất
        </h2>

        <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#111219] shadow-xl shadow-black/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-[0.18em] text-white/35">Tiêu đề</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-[0.18em] text-white/35">Lượt xem</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-[0.18em] text-white/35">Trạng thái</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-[0.18em] text-white/35">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.recentStreams.map((s) => (
                <tr key={s.id} className="transition hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5 font-semibold text-white">{s.title}</td>
                  <td className="px-5 py-3.5 text-white/60">{s.viewerCount.toLocaleString('vi-VN')}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${statusColor[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white/35">
                    {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true, locale: vi })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
