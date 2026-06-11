// src/app/(dashboard)/stream/[id]/page.tsx
'use client';

import { useEffect, useRef, useState, type ReactNode, type ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStream } from '@/lib/hooks/use-streams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { StreamPlayer } from '@/components/stream/stream-player';
import { StreamChat } from '@/components/stream/stream-chat';
import { DonateAlertOverlay } from '@/components/donate/donate-alert-overlay';
import { Icons } from '@/components/ui/icons';
import { useAppSelector } from '@/types/redux-type';
import { useUpload } from '@/lib/hooks/use-upload';
import { streamsApi } from '@/lib/api/streams';
import {
    Bookmark,
    Copy,
    DollarSign,
    Eye,
    EyeOff,
    Heart,
    Megaphone,
    MessageSquare,
    Pencil,
    Play,
    Scissors,
    Share2,
    Sparkles,
    Square,
    Upload,
    UserPlus,
    Users,
    Video,
    Volume2,
    Wifi,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api/config';

export default function StreamControlPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const { uploadFile, isUploading } = useUpload();

    const streamId = params.id as string;
    const { stream, credentials, updateStream, isLoading } = useStream(streamId);

    const [isStarting, setIsStarting] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // ── Editable fields (local state, sync từ stream khi load) ──────────
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // thumbnail: file chờ upload + preview URL
    const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const API_BASE = API_BASE_URL;

    // Sync local edit state khi stream load lần đầu
    useEffect(() => {
        if (stream) {
            setEditTitle(stream.title);
            setEditDescription(stream.description ?? '');
        }
    }, [stream?.id]); // chỉ sync khi id thay đổi, không override khi user đang gõ

    useEffect(() => {
        if (stream && user && stream.streamer.id !== user.id) {
            router.push(`/watch/${streamId}`);
        }
    }, [stream, user, streamId, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#08090d] text-white">
                <Icons.spinner className="h-8 w-8 animate-spin text-[#9b7cff]" />
            </div>
        );
    }

    if (!stream) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#08090d] text-white">
                <p className="text-white/60">Stream not found</p>
            </div>
        );
    }

    const isLive = stream.status === 'LIVE';
    const isIdle = stream.status === 'IDLE';
    const canEdit = isIdle;

    // Thumbnail hiển thị: ưu tiên preview local → thumbnailUrl từ API → fallback
    const displayThumbnail =
        thumbnailPreview ||
        stream.thumbnailUrl ||
        'https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=900&auto=format&fit=crop';

    function handleThumbnailChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
    }

    // ── Save changes (title, description, thumbnail) ────────────────────
    async function handleSaveChanges() {
        if (!user) return;
        setIsSaving(true);

        try {
            let thumbnailUrl: string | undefined;

            // Upload thumbnail lên MinIO nếu user đã chọn ảnh mới
            if (thumbnailFile) {
                try {
                    thumbnailUrl = await uploadFile(user.id, thumbnailFile, 'THUMBNAIL');
                    setThumbnailFile(null);
                    // Giữ preview cho đến khi query refetch
                } catch {
                    toast.error('Upload thumbnail thất bại');
                }
            }

            await streamsApi.updateStream(streamId, {
                title: editTitle.trim() || stream?.title,
                description: editDescription.trim() || null,
                ...(thumbnailUrl ? { thumbnailUrl } : {}),
            });

            toast.success('Đã lưu thay đổi');
        } catch (err: any) {
            toast.error('Lưu thất bại', { description: err?.message });
        } finally {
            setIsSaving(false);
        }
    }

    const handleStartStream = async () => {
        setIsStarting(true);
        try {
            // Nếu có thay đổi chưa lưu thì save trước khi go live
            if (canEdit) await handleSaveChanges();

            await fetch(`${API_BASE}/streams/${streamId}/start`, {
                method: 'POST',
                credentials: 'include',
            });
            toast('You are now live');
        } catch {
            toast('Failed to start stream');
        } finally {
            setIsStarting(false);
        }
    };

    const handleEndStream = async () => {
        setIsEnding(true);
        try {
            await fetch(`${API_BASE}/streams/${streamId}/end`, {
                method: 'POST',
                credentials: 'include',
            });
            toast('Your stream has been stopped');
            router.push('/dashboard');
        } catch {
            toast('Failed to end stream');
        } finally {
            setIsEnding(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast(`${label} copied to clipboard`);
    };

    const hasUnsavedChanges =
        canEdit &&
        (editTitle !== stream.title ||
            editDescription !== (stream.description ?? '') ||
            thumbnailFile !== null);

    return (
        <div className="min-h-screen bg-[#08090d] p-4 text-white md:p-6">
            <div className="mx-auto max-w-[1500px]">
                {/* Header */}
                <header className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                        {/* Title — editable khi IDLE */}
                        {canEdit ? (
                            <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="mb-1 h-auto border-white/10 bg-transparent px-0 text-3xl font-black tracking-tight text-white focus-visible:ring-0 focus-visible:ring-offset-0 md:text-4xl"
                                placeholder="Stream title..."
                            />
                        ) : (
                            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                                {stream.title}
                            </h1>
                        )}

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/40">
                            <span>
                                {isLive ? 'Session: 04:12:45' : 'Session: Ready to start'}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-white/25" />
                            {stream.category && (
                                <span className="text-violet-400">{stream.category.name}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <StatCard
                                icon={<Users className="h-5 w-5" />}
                                label="Viewers"
                                value={formatCompact(stream.viewerCount || 0)}
                                color="cyan"
                            />
                            <StatCard
                                icon={<UserPlus className="h-5 w-5" />}
                                label="Followers"
                                value="+412"
                                color="violet"
                            />
                            <StatCard
                                icon={<DollarSign className="h-5 w-5" />}
                                label="Revenue"
                                value="$1,240.50"
                                color="pink"
                            />
                        </div>

                        <div className="flex gap-2">
                            {/* Save button — chỉ hiện khi có thay đổi chưa lưu */}
                            {hasUnsavedChanges && (
                                <Button
                                    onClick={handleSaveChanges}
                                    disabled={isSaving || isUploading}
                                    className="h-12 rounded-xl bg-cyan-500 px-5 font-black text-[#08090d] hover:bg-cyan-400"
                                >
                                    {isSaving || isUploading ? (
                                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Pencil className="mr-2 h-4 w-4" />
                                    )}
                                    Save
                                </Button>
                            )}

                            {isIdle && (
                                <Button
                                    onClick={handleStartStream}
                                    disabled={isStarting || isSaving || isUploading}
                                    className="h-12 rounded-xl bg-[#9b7cff] px-5 font-black text-[#120c25] shadow-[0_0_22px_rgba(155,124,255,0.35)] hover:bg-[#aa8cff]"
                                >
                                    {isStarting ? (
                                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Play className="mr-2 h-4 w-4 fill-current" />
                                    )}
                                    Go Live
                                </Button>
                            )}

                            {isLive && (
                                <Button
                                    onClick={handleEndStream}
                                    disabled={isEnding}
                                    className="h-12 rounded-xl bg-pink-500 px-5 font-black text-white shadow-[0_0_22px_rgba(236,72,153,0.25)] hover:bg-pink-400"
                                >
                                    {isEnding ? (
                                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Square className="mr-2 h-4 w-4 fill-current" />
                                    )}
                                    End Stream
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main layout */}
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
                    <main className="min-w-0 space-y-5">
                        {/* Preview */}
                        <section className="relative overflow-hidden rounded-2xl bg-[#050609] shadow-2xl shadow-black/40">
                            <div className="relative aspect-video min-h-[280px] overflow-hidden rounded-2xl bg-black">
                                {isLive && credentials?.playbackUrl ? (
                                    <StreamPlayer url={credentials.playbackUrl} />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,rgba(155,124,255,0.18),transparent_32%),linear-gradient(135deg,#06070b,#11131b_45%,#06070b)]">
                                        <div className="absolute inset-0 opacity-40 [background:repeating-linear-gradient(115deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_10px)]" />
                                        <div className="relative z-10 text-center">
                                            <Video className="mx-auto mb-4 h-14 w-14 text-white/25" />
                                            <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/35">
                                                {isIdle ? 'Waiting for signal' : 'Loading preview'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isLive && <DonateAlertOverlay roomId={streamId} />}

                                <div className="absolute left-4 top-4 flex items-center gap-3">
                                    <StatusPill live={isLive} />
                                    <span className="rounded-full bg-black/70 px-3 py-1.5 text-xs font-black text-white backdrop-blur">
                                        {stream.metrics?.resolution ?? '1080p'}{' '}
                                        {stream.metrics?.fps ? `${stream.metrics.fps}fps` : '60fps'}
                                    </span>
                                </div>

                                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                                    <button className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-white backdrop-blur transition hover:bg-white/15">
                                        <Play className="h-5 w-5 fill-current" />
                                    </button>
                                    <button className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-white backdrop-blur transition hover:bg-white/15">
                                        <Volume2 className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="absolute bottom-6 right-5 flex items-center gap-3">
                                    <span className="text-xs font-bold text-white/70">
                                        Bitrate:{' '}
                                        {stream.metrics?.bitrate
                                            ? `${stream.metrics.bitrate} kbps`
                                            : '— kbps'}
                                    </span>
                                    <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/15">
                                        <div className="h-full w-[82%] rounded-full bg-cyan-400" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Thumbnail editor — chỉ hiện khi IDLE */}
                        {canEdit && (
                            <section className="rounded-2xl bg-[#171820] p-5 shadow-xl shadow-black/20">
                                <h2 className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-white/45">
                                    Thumbnail
                                </h2>

                                <div className="group relative h-[180px] w-full max-w-[320px] overflow-hidden rounded-xl bg-[#202026]">
                                    <img
                                        src={displayThumbnail}
                                        alt="Stream thumbnail"
                                        className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-50"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => thumbnailInputRef.current?.click()}
                                        className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/65 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-violet-500 group-hover:flex"
                                    >
                                        <Upload className="size-4" />
                                        Change thumbnail
                                    </button>

                                    {thumbnailFile && (
                                        <div className="absolute right-2 top-2 rounded-md bg-violet-500 px-2 py-0.5 text-[10px] font-black text-white">
                                            Pending upload
                                        </div>
                                    )}

                                    <input
                                        ref={thumbnailInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        className="hidden"
                                    />
                                </div>

                                <p className="mt-2 text-xs text-white/30">
                                    Thumbnail sẽ được upload khi bạn bấm Save hoặc Go Live.
                                </p>
                            </section>
                        )}

                        {/* Description editor — chỉ hiện khi IDLE */}
                        {canEdit && (
                            <section className="rounded-2xl bg-[#171820] p-5 shadow-xl shadow-black/20">
                                <h2 className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-white/45">
                                    Description
                                </h2>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Describe your stream..."
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                                />
                            </section>
                        )}

                        {/* Action buttons */}
                        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <ActionButton icon={<Scissors className="h-6 w-6" />} label="Clip That" color="violet" />
                            <ActionButton icon={<Bookmark className="h-6 w-6 fill-current" />} label="Stream Marker" color="cyan" />
                            <ActionButton icon={<Megaphone className="h-6 w-6" />} label="Run Ad" color="pink" />
                            <ActionButton icon={<Sparkles className="h-6 w-6" />} label="Raid Channel" color="white" />
                        </section>

                        {/* Stream Health */}
                        <section className="rounded-2xl bg-[#171820] p-5 shadow-xl shadow-black/20">
                            <h2 className="mb-5 text-sm font-black uppercase tracking-[0.22em] text-white/45">
                                Stream Health
                            </h2>
                            <div className="grid gap-5 md:grid-cols-3">
                                <HealthMetric label="Dropped Frames" value="0%" percent={0} color="cyan" />
                                <HealthMetric label="CPU Usage" value="24%" percent={24} color="violet" />
                                <HealthMetric label="Memory" value="4.2GB" percent={68} color="pink" />
                            </div>
                        </section>

                        {/* OBS setup */}
                        {isIdle && credentials && (
                            <section className="rounded-2xl border border-cyan-400/15 bg-[#111219] p-5 shadow-xl shadow-black/20">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-sm font-black uppercase tracking-[0.22em] text-white/55">
                                            OBS / Streaming Software
                                        </h2>
                                        <p className="mt-2 text-sm text-white/40">
                                            Copy these values into OBS, start streaming, then press Go Live.
                                        </p>
                                    </div>
                                    <Wifi className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div className="space-y-4">
                                    <CopyField
                                        label="RTMP URL"
                                        value={credentials.rtmpUrl}
                                        onCopy={() => copyToClipboard(credentials.rtmpUrl, 'RTMP URL')}
                                    />
                                    <CopyField
                                        label="Stream Key"
                                        value={credentials.streamKey}
                                        type="password"
                                        onCopy={() => copyToClipboard(credentials.streamKey, 'Stream Key')}
                                    />
                                </div>
                                <p className="mt-4 text-xs font-semibold text-pink-300/80">
                                    Keep your stream key private. Treat it like a password.
                                </p>
                            </section>
                        )}

                        {/* Settings */}
                        <section className="rounded-2xl bg-[#171820] p-5 shadow-xl shadow-black/20">
                            <h2 className="mb-5 text-sm font-black uppercase tracking-[0.22em] text-white/45">
                                Stream Settings
                            </h2>
                            <div className="space-y-5">
                                <SettingRow
                                    icon={<MessageSquare className="h-5 w-5" />}
                                    title="Enable Chat"
                                    description="Allow viewers to chat during your stream"
                                    checked={stream.isChatEnabled}
                                    onCheckedChange={(checked) => updateStream({ isChatEnabled: checked })}
                                    disabled={isLive}
                                />
                                <SettingRow
                                    icon={stream.isPublic ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                    title="Public Stream"
                                    description="Make this stream visible in browse page"
                                    checked={stream.isPublic}
                                    onCheckedChange={(checked) => updateStream({ isPublic: checked })}
                                    disabled={isLive}
                                />
                            </div>
                        </section>

                        {/* Bottom status */}
                        <section className="flex justify-center pt-8">
                            <div className="flex items-center gap-5 rounded-full bg-[#101118] px-6 py-3 shadow-2xl shadow-black/40">
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-white/55">
                                    <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
                                    Bitrate Stable
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-white/70">
                                    <Heart className="h-5 w-5 fill-pink-400 text-pink-400" />
                                    4.2k
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-white/70">
                                    <Share2 className="h-5 w-5 text-cyan-400" />
                                    892
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-white/70">
                                    <MessageSquare className="h-5 w-5 text-violet-400" />
                                    15k
                                </div>
                            </div>
                        </section>
                    </main>

                    {/* Real-time chat — dùng chung component với trang watch */}
                    <aside className="min-w-0">
                        {stream.isChatEnabled && isLive ? (
                            <StreamChat roomId={streamId} />
                        ) : (
                            <div className="flex min-h-[640px] items-center justify-center rounded-2xl bg-[#1e1f27] p-6 text-center">
                                <div>
                                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-white/25" />
                                    <p className="font-bold text-white/70">
                                        {stream.isChatEnabled
                                            ? 'Chat will be available when the stream is live'
                                            : 'Chat is disabled'}
                                    </p>
                                    <p className="mt-1 text-sm text-white/40">
                                        {stream.isChatEnabled
                                            ? 'Start the stream to connect to the live chat room.'
                                            : 'Turn chat back on from Stream Settings.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}

// ── Sub-components (giữ nguyên, chỉ thêm disabled vào SettingRow) ────────

function SettingRow({
    icon, title, description, checked, onCheckedChange, disabled = false,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <div className={`flex items-center justify-between gap-5 rounded-2xl bg-black/20 p-4 ${disabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-cyan-300">
                    {icon}
                </div>
                <div>
                    <p className="font-black text-white">{title}</p>
                    <p className="mt-0.5 text-sm text-white/40">{description}</p>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    color: 'cyan' | 'violet' | 'pink';
}) {
    const colors = {
        cyan: 'bg-cyan-400/10 text-cyan-300',
        violet: 'bg-violet-400/10 text-violet-300',
        pink: 'bg-pink-400/10 text-pink-300',
    };

    return (
        <div className="flex h-[74px] min-w-[172px] items-center gap-4 rounded-2xl bg-[#171820] px-5 shadow-xl shadow-black/20">
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${colors[color]}`}>
                {icon}
            </div>

            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">
                    {label}
                </p>
                <p className="mt-1 text-xl font-black text-white">{value}</p>
            </div>
        </div>
    );
}

function StatusPill({ live }: { live: boolean }) {
    return (
        <span
            className={
                live
                    ? 'inline-flex items-center rounded-full bg-pink-500 px-3 py-1.5 text-xs font-black uppercase text-white shadow-[0_0_18px_rgba(236,72,153,0.45)]'
                    : 'inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase text-white/65'
            }
        >
            <span
                className={
                    live
                        ? 'mr-2 h-2 w-2 rounded-full bg-white'
                        : 'mr-2 h-2 w-2 rounded-full bg-white/35'
                }
            />
            {live ? 'Live' : 'Idle'}
        </span>
    );
}

function ActionButton({
    icon,
    label,
    color,
}: {
    icon: ReactNode;
    label: string;
    color: 'violet' | 'cyan' | 'pink' | 'white';
}) {
    const colors = {
        violet: 'text-violet-300',
        cyan: 'text-cyan-300',
        pink: 'text-pink-300',
        white: 'text-white/80',
    };

    return (
        <button className="group flex h-[92px] flex-col items-center justify-center gap-3 rounded-2xl bg-[#171820] text-white/60 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#20212b]">
            <div className={colors[color]}>{icon}</div>
            <span className="text-sm font-black text-white/55 transition group-hover:text-white/80">
                {label}
            </span>
        </button>
    );
}

function HealthMetric({
    label,
    value,
    percent,
    color,
}: {
    label: string;
    value: string;
    percent: number;
    color: 'cyan' | 'violet' | 'pink';
}) {
    const colors = {
        cyan: 'bg-cyan-400',
        violet: 'bg-violet-400',
        pink: 'bg-pink-400',
    };

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-white/45">{label}</span>
                <span
                    className={
                        color === 'cyan'
                            ? 'text-xs font-black text-cyan-300'
                            : color === 'violet'
                                ? 'text-xs font-black text-violet-300'
                                : 'text-xs font-black text-pink-300'
                    }
                >
                    {value}
                </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                    className={`h-full rounded-full ${colors[color]}`}
                    style={{ width: `${Math.max(percent, 6)}%` }}
                />
            </div>
        </div>
    );
}

function CopyField({
    label,
    value,
    type = 'text',
    onCopy,
}: {
    label: string;
    value: string;
    type?: 'text' | 'password';
    onCopy: () => void;
}) {
    return (
        <div>
            <Label className="text-xs font-black uppercase tracking-wide text-white/35">
                {label}
            </Label>

            <div className="mt-2 flex gap-2">
                <Input
                    value={value}
                    readOnly
                    type={type}
                    className="h-11 border-white/10 bg-black/30 font-mono text-sm text-white placeholder:text-white/30 focus-visible:ring-cyan-400/30"
                />

                <Button
                    type="button"
                    onClick={onCopy}
                    className="h-11 w-11 shrink-0 rounded-xl bg-white/10 text-white hover:bg-white/15"
                >
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function formatCompact(value: number) {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }

    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;
    }

    return String(value);
}
