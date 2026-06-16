'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Eye, Calendar, Play, Radio,
  ExternalLink, Loader2
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { usersAPI, PublicProfile } from '@/lib/api/users';
import { FollowButton } from '@/components/follow/follow-button';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    usersAPI
      .getPublicProfile(username)
      .then((data) => {
        setProfile(data);
        setFollowerCount(data.followerCount);
      })
      .catch(() => setError('Không tìm thấy streamer này'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400 gap-4">
        <p className="text-xl">{error ?? 'Không tìm thấy'}</p>
        <button onClick={() => router.back()} className="text-purple-400 hover:underline">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      {/* Ảnh bìa / Tiêu đề */}
      <div className="relative h-48 sm:h-64 lg:h-80 bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-[#0f0f1a] overflow-hidden">
        {profile.coverImage ? (
          <img
            src={profile.coverImage}
            alt="bìa"
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-800/40 via-pink-800/20 to-transparent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent" />
      </div>

      {/* Thông tin hồ sơ */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row items-start sm:items-end gap-4 pb-6 border-b border-white/10">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-[#0f0f1a] shadow-2xl">
              <AvatarImage src={profile.avatar ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-4xl font-bold">
                {profile.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {profile.isLive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                ĐANG PHÁT
              </div>
            )}
          </div>

          {/* Tên & Thống kê */}
          <div className="flex-1 min-w-0 sm:pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{profile.username}</h1>
              {profile.isLive && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1">
                  <Radio className="w-3 h-3" /> Đang Live
                </Badge>
              )}
            </div>
            {profile.fullName && (
              <p className="text-gray-400 mt-0.5">{profile.fullName}</p>
            )}
            {profile.bio && (
              <p className="text-gray-300 text-sm mt-2 max-w-lg">{profile.bio}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <strong className="text-white">{followerCount.toLocaleString()}</strong> người theo dõi
              </span>
              <span className="flex items-center gap-1.5">
                <Play className="w-4 h-4" />
                <strong className="text-white">{profile.totalStreams}</strong> stream
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Tham gia {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true, locale: vi })}
              </span>
            </div>
          </div>

          {/* Hành động */}
          <div className="flex items-center gap-2 sm:pb-2 shrink-0">
            {profile.isLive && profile.liveStream && (
              <Link href={`/watch/${profile.liveStream.id}`}>
                <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Radio className="w-4 h-4" />
                  Xem Live
                </button>
              </Link>
            )}
            <FollowButton
              username={profile.username}
              onFollowChange={(followed) =>
                setFollowerCount((prev) => prev + (followed ? 1 : -1))
              }
            />
          </div>
        </div>

        {/* Biểu ngữ Live Stream */}
        {profile.isLive && profile.liveStream && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Đang phát trực tiếp
            </h2>
            <Link href={`/watch/${profile.liveStream.id}`}>
              <div className="relative rounded-xl overflow-hidden bg-black/40 border border-red-500/30 hover:border-red-500/60 transition-all group cursor-pointer">
                <div className="relative aspect-video">
                  {profile.liveStream.thumbnailUrl ? (
                    <img
                      src={profile.liveStream.thumbnailUrl}
                      alt={profile.liveStream.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-pink-900/20">
                      <Radio className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-lg">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ĐANG PHÁT
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-3 py-1 rounded-lg flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {profile.liveStream.viewerCount.toLocaleString()} đang xem
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white text-lg">{profile.liveStream.title}</h3>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Video đã phát */}
        <div className="mt-8 pb-12">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-purple-400" />
            Video đã phát ({profile.pastStreams.length})
          </h2>

          {profile.pastStreams.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Play className="w-12 h-12 mx-auto mb-3 opacity-20
                " />
              Chưa có video nào được lưu
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {profile.pastStreams.map((stream) => (
                <PastStreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PastStreamCard({
  stream,
}: {
  stream: PublicProfile['pastStreams'][number];
}) {
  return (
    <Link
      href={`/watch/past/${stream.id}`}
      className="bg-white/5 border border-white/10 hover:border-purple-500/30 rounded-xl overflow-hidden transition-all group block"
    >
      {/* Hình thu nhỏ */}
      <div className="relative aspect-video bg-black/40">
        {stream.thumbnailUrl ? (
          <img
            src={stream.thumbnailUrl}
            alt={stream.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/10">
            <Play className="w-8 h-8 text-gray-600" />
          </div>
        )}

        {/* Biểu tượng phát khi hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Thông tin */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">
          {stream.title}
        </h3>

        <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {stream.viewerCount.toLocaleString()} lượt xem
          </span>

          <span>
            {formatDistanceToNow(new Date(stream.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
        </div>

        {stream.category && (
          <Badge
            variant="secondary"
            className="mt-2 text-[10px] bg-white/10 text-gray-300 border-0"
          >
            {stream.category.name}
          </Badge>
        )}
      </div>
    </Link>
  );
}
