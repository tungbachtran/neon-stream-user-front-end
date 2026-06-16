'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    Calendar,
    Clock3,
    Eye,
    Loader2,
    Play,
    Share2,
    Tag,
    VideoOff,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FollowButton } from '../follow/follow-button';
import { usePastStream } from '@/lib/hooks/use-past-stream';

interface Streamer {
    username: string;
    fullName?: string | null;
    avatar?: string | null;
    followerCount?: number;
}

export interface PastStream {
    id: string;
    title: string;
    description?: string | null;

    recordingUrl: string;
    thumbnailUrl?: string | null;

    viewCount?: number;
    startedAt?: string | null;
    endedAt?: string | null;
    duration?: number | null;

    streamer: Streamer;
}

export interface PastStreamResponse {
    stream: PastStream;
    otherStreams: PastStream[];
}

interface PastStreamWatchPageProps {
    streamId: string;
}

export function PastStreamWatchPage({
    streamId,
}: PastStreamWatchPageProps) {

    const { data, isLoading, error } = usePastStream(streamId);

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#0e0e11] px-4 py-6 text-white md:px-6">
                <div className="mx-auto flex min-h-[500px] max-w-[1500px] items-center justify-center">
                    <Loader2 className="h-9 w-9 animate-spin text-violet-400" />
                </div>
            </main>
        );
    }

    if (error || !data?.stream) {
        return (
            <main className="min-h-screen bg-[#0e0e11] px-4 py-6 text-white md:px-6">
                <div className="mx-auto flex min-h-[500px] max-w-[1500px] flex-col items-center justify-center">
                    <VideoOff className="mb-4 h-12 w-12 text-white/25" />

                    <h1 className="text-xl font-black text-white">
                        Không thể phát video
                    </h1>

                    <p className="mt-2 text-sm text-white/45">
                        {error?.message || 'Past stream này không còn tồn tại.'}
                    </p>

                    <Button asChild className="mt-6 rounded-xl bg-[#8b6cff]">
                        <Link href="/">Quay lại trang chủ</Link>
                    </Button>
                </div>
            </main>
        );
    }

    const { stream, otherStreams } = data;

    return (
        <main className="min-h-screen bg-[#0e0e11] px-4 pb-16 pt-5 text-white md:px-6">
            <div className="mx-auto max-w-[1500px]">
                <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                    {/* Video chính */}
                    <section className="min-w-0">
                        <div className="overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/30">
                            <div className="aspect-video w-full">
                                <video
                                    key={stream.id}
                                    src={stream.recordingUrl}
                                    poster={stream.thumbnailUrl || undefined}
                                    controls
                                    autoPlay
                                    playsInline
                                    preload="metadata"
                                    className="h-full w-full bg-black object-contain"
                                >
                                    Trình duyệt của bạn không hỗ trợ phát video.
                                </video>
                            </div>
                        </div>
                    </section>

                    {/* Danh sách video khác */}
                    <aside className="overflow-hidden rounded-2xl bg-[#16161b] xl:sticky xl:top-5">
                        <div className="border-b border-white/[0.06] px-5 py-4">
                            <h2 className="text-lg font-black text-white">
                                Thêm từ {stream.streamer.username}
                            </h2>

                            <p className="mt-1 text-xs font-medium text-white/35">
                                Các buổi phát trước của streamer
                            </p>
                        </div>

                        {otherStreams.length > 0 ? (
                            <div className="max-h-[calc(56.25vw-20px)] space-y-1 overflow-y-auto p-2 xl:max-h-[640px]">
                                {otherStreams.map((item) => (
                                    <PastStreamListItem key={item.id} stream={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04]">
                                    <VideoOff className="h-6 w-6 text-white/25" />
                                </div>

                                <p className="mt-4 font-bold text-white/65">
                                    Không còn video nào khác
                                </p>

                                <p className="mt-1 max-w-[230px] text-sm leading-6 text-white/30">
                                    Streamer này hiện chưa có thêm past stream để phát.
                                </p>
                            </div>
                        )}
                    </aside>
                </div>

                {/* Thông tin stream */}
                <StreamInformation stream={stream} />
            </div>
        </main>
    );
}

function PastStreamListItem({ stream }: { stream: PastStream }) {
    return (
        <Link
            href={`/watch/past/${stream.id}`}
            className="group flex gap-3 rounded-xl p-2 transition hover:bg-white/[0.06]"
        >
            <div className="relative aspect-video w-[145px] shrink-0 overflow-hidden rounded-lg bg-[#24242b]">
                {stream.thumbnailUrl ? (
                    <img
                        src={stream.thumbnailUrl}
                        alt={stream.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Play className="h-6 w-6 fill-white/25 text-white/25" />
                    </div>
                )}

                {stream.duration ? (
                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {formatDuration(stream.duration)}
                    </span>
                ) : null}

                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                    <div className="flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-white text-black opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
                        <Play className="ml-0.5 h-4 w-4 fill-current" />
                    </div>
                </div>
            </div>

            <div className="min-w-0 flex-1 py-0.5">
                <h3 className="line-clamp-2 text-sm font-bold leading-5 text-white/85 transition group-hover:text-white">
                    {stream.title}
                </h3>

                <p className="mt-1 truncate text-xs font-semibold text-white/35">
                    {stream.streamer.username}
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-white/30">
                    <span>{formatCompact(stream.viewCount || 0)} lượt xem</span>

                    {stream.startedAt ? (
                        <>
                            <span>•</span>
                            <span>
                                {formatDistanceToNow(new Date(stream.startedAt), {
                                    addSuffix: true,
                                })}
                            </span>
                        </>
                    ) : null}
                </div>
            </div>
        </Link>
    );
}

function StreamInformation({ stream }: { stream: PastStream }) {
    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: stream.title,
                    url: window.location.href,
                });

                return;
            }

            await navigator.clipboard.writeText(window.location.href);
        } catch {
            // Người dùng đóng hộp thoại chia sẻ hoặc clipboard bị chặn.
        }
    };

    return (
        <section className="mt-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                    <div className="flex items-start gap-4">
                        <div className="hidden self-stretch w-1 rounded-full bg-[#8b6cff] sm:block" />

                        <div>
                            <h1 className="max-w-[760px] text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
                                {stream.title}
                            </h1>

                            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                                <Link href={`/profile/${stream.streamer.username}`}>
                                    <span className="font-bold text-cyan-400 hover:text-cyan-300">
                                        {stream.streamer.username}
                                    </span>
                                </Link>

                                <span className="h-1 w-1 rounded-full bg-white/25" />

                                <span className="flex items-center gap-1.5 text-sm font-semibold text-white/45">
                                    <Eye className="h-3.5 w-3.5" />
                                    {formatCompact(stream.viewCount || 0)} lượt xem
                                </span>

                                {stream.startedAt ? (
                                    <>
                                        <span className="h-1 w-1 rounded-full bg-white/25" />

                                        <span className="flex items-center gap-1.5 text-sm text-white/45">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Phát{' '}
                                            {formatDistanceToNow(new Date(stream.startedAt), {
                                                addSuffix: true,
                                            })}
                                        </span>
                                    </>
                                ) : null}

                                {stream.duration ? (
                                    <>
                                        <span className="h-1 w-1 rounded-full bg-white/25" />

                                        <span className="flex items-center gap-1.5 text-sm text-white/45">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            {formatDuration(stream.duration)}
                                        </span>
                                    </>
                                ) : null}
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                <Pill>Past Stream</Pill>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-3">
                    <FollowButton
                        username={stream.streamer.username}
                        size="sm"
                    />


                </div>
            </div>

            {/* Thông tin streamer */}
            <Link href={`/profile/${stream.streamer.username}`}>
                <div className="mt-7 flex max-w-[1100px] items-center gap-4 rounded-2xl bg-[#16161b] p-4 transition hover:bg-[#1d1d24]">
                    <Avatar className="h-12 w-12 ring-2 ring-violet-400/40">
                        <AvatarImage src={stream.streamer.avatar || undefined} />

                        <AvatarFallback className="bg-[#8b6cff] font-black text-white">
                            {stream.streamer.username[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                        <p className="truncate font-black text-white">
                            {stream.streamer.fullName ||
                                stream.streamer.username}
                        </p>

                        <p className="truncate text-sm text-white/40">
                            @{stream.streamer.username}
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                            {formatCompact(
                                stream.streamer.followerCount || 0,
                            )}{' '}
                            người theo dõi
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        className="rounded-xl border-white/10 bg-transparent font-bold text-white/70 hover:bg-white/5 hover:text-white"
                    >
                        Xem Hồ Sơ
                    </Button>
                </div>
            </Link>

            {/* Mô tả video */}
            <div className="mt-8 max-w-[1100px] rounded-2xl bg-[#1a1a20] p-6 shadow-xl shadow-black/10">
                <h3 className="mb-4 text-xl font-black text-white">
                    Về Buổi Phát Này
                </h3>

                <p className="whitespace-pre-line text-sm leading-7 text-white/55">
                    {stream.description ||
                        'Streamer chưa thêm mô tả cho buổi phát này.'}
                </p>
            </div>
        </section>
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
        <span
            className={
                accent
                    ? 'rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-300'
                    : 'rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/50'
            }
        >
            {children}
        </span>
    );
}

function formatCompact(value: number) {
    return new Intl.NumberFormat('vi', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

/**
 * duration nhận theo đơn vị giây.
 */
function formatDuration(duration: number) {
    const totalSeconds = Math.max(0, Math.floor(duration));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return [
            hours,
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0'),
        ].join(':');
    }

    return [
        minutes,
        seconds.toString().padStart(2, '0'),
    ].join(':');
}
