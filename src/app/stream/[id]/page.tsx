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
import { GiftAnimationOverlay } from '@/components/gifts/gift-animation-overlay';

export default function StreamControlPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const { uploadImage, isUploading } = useUpload();

    const streamId = params.id as string;
    const { stream, credentials, updateStream, isLoading } = useStream(streamId);

    const [isStarting, setIsStarting] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // ── Các trường có thể chỉnh sửa (trạng thái cục bộ, đồng bộ từ stream khi tải) ──────────
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // thumbnail: file chờ upload + preview URL
    const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    const API_BASE = API_BASE_URL;

    // Đồng bộ trạng thái chỉnh sửa cục bộ khi stream tải lần đầu
    useEffect(() => {
        if (stream) {
            setEditTitle(stream.title);
            setEditDescription(stream.description ?? '');
        }
    }, [stream?.id]); // chỉ đồng bộ khi id thay đổi, không ghi đè khi user đang gõ

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
                <p className="text-white/60">Không tìm thấy stream</p>
            </div>
        );
    }

    const isLive = stream.status === 'LIVE';
    const isIdle = stream.status === 'IDLE';
    const canEdit = isIdle;

    // Thumbnail hiển thị: ưu tiên preview cục bộ → thumbnailUrl từ API → fallback
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

    // ── Lưu thay đổi (tiêu đề, mô tả, thumbnail) ────────────────────
    async function handleSaveChanges() {
        if (!user) return;
        setIsSaving(true);

        try {
            let thumbnailUrl: string | undefined;

            // Upload thumbnail lên MinIO nếu user đã chọn ảnh mới
            if (thumbnailFile) {
                try {
                    thumbnailUrl = await uploadImage(thumbnailFile, "thumbnail");
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
            // Nếu có thay đổi chưa lưu thì save trước khi phát trực tiếp
            if (canEdit) await handleSaveChanges();

            await fetch(`${API_BASE}/streams/${streamId}/start`, {
                method: 'POST',
                credentials: 'include',
            });
            toast('Bạn đang phát trực tiếp');
        } catch {
            toast('Không thể bắt đầu stream');
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
            toast('Stream của bạn đã bị dừng');
            router.push('/dashboard');
        } catch {
            toast('Không thể kết thúc stream');
        } finally {
            setIsEnding(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast(`${label} đã được sao chép vào bộ nhớ tạm`);
    };

    const hasUnsavedChanges =
        canEdit &&
        (editTitle !== stream.title ||
            editDescription !== (stream.description ?? '') ||
            thumbnailFile !== null);

    return (
        <div className=" h-[850px] overflow-auto bg-[#08090d] p-4 text-white ">
            <div className="mx-auto max-w-[1500px]">
                {/* Tiêu đề */}
                <header className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                        {/* Tiêu đề — có thể chỉnh sửa khi IDLE */}
                        {canEdit ? (
                            <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="mb-1 h-auto border-white/10 bg-transparent px-0 text-3xl font-black tracking-tight text-white focus-visible:ring-0 focus-visible:ring-offset-0 md:text-4xl"
                                placeholder="Tiêu đề stream..."
                            />
                        ) : (
                            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                                {stream.title}
                            </h1>
                        )}

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/40">
                            <span>
                                {isLive ? 'Phiên: 04:12:45' : 'Phiên: Sẵn sàng để bắt đầu'}
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
                                label="Người Xem"
                                value={formatCompact(stream.viewerCount || 0)}
                                color="cyan"
                            />
                            <StatCard
                                icon={<UserPlus className="h-5 w-5" />}
                                label="Người Theo Dõi"
                                value="+412"
                                color="violet"
                            />
                            <StatCard
                                icon={<DollarSign className="h-5 w-5" />}
                                label="Doanh Thu"
                                value="$1,240.50"
                                color="pink"
                            />
                        </div>

                        <div className="flex gap-2">
                            {/* Nút lưu — chỉ hiện khi có thay đổi chưa lưu */}
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
                                    Lưu
                                </Button>
                            )}

                        </div>
                    </div>
                </header>

                {/* Bố cục chính */}
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
                    <main className="min-w-0 space-y-5">
                        {/* Xem trước */}
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
                                                {isIdle ? 'Chờ tín hiệu' : 'Đang tải xem trước'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isLive && <DonateAlertOverlay roomId={streamId} />}
                                {isLive && <GiftAnimationOverlay streamId={streamId} />}

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

                               
                            </div>
                        </section>

                        {/* Trình chỉnh sửa thumbnail — chỉ hiện khi IDLE */}
                        {canEdit && (
                            <section className="rounded-2xl bg-[#171820] p-5 shadow-xl shadow-black/20">
                                <h2 className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-white/45">
                                    Hình Thu Nhỏ
                                </h2>

                                <div className="group relative h-[180px] w-full max-w-[320px] overflow-hidden rounded-xl bg-[#202026]">
                                    <img
                                        src={displayThumbnail}
                                        alt="Hình thu nhỏ stream"
                                        className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-50"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => thumbnailInputRef.current?.click()}
                                        className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/65 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-violet-500 group-hover:flex"
                                    >
                                        <Upload className="size-4" />
                                        Thay đổi hình thu nhỏ
                                    </button>

                                    {thumbnailFile && (
                                        <div className="absolute right-2 top-2 rounded-md bg-violet-500 px-2 py-0.5 text-[10px] font-black text-white">
                                            Chờ upload
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
                                    Hình thu nhỏ sẽ được upload khi bạn bấm Lưu hoặc Phát Trực Tiếp.
                                </p>
                            </section>
                        )}

                        {/* Trình chỉnh sửa mô tả — chỉ hiện khi IDLE */}
                        {canEdit && (
                            <section className="rounded-2xl bg-[#171820] p-5 shadow-xl shadow-black/20">
                                <h2 className="mb-4 text-sm font-black uppercase tracking-[0.22em] text-white/45">
                                    Mô Tả
                                </h2>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    placeholder="Mô tả stream của bạn..."
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                                />
                            </section>
                        )}

                       

                        {/* Thiết lập OBS */}
                        {isIdle && credentials && (
                            <section className="rounded-2xl border border-cyan-400/15 bg-[#111219] p-5 shadow-xl shadow-black/20">
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-sm font-black uppercase tracking-[0.22em] text-white/55">
                                            OBS / Phần Mềm Phát Trực Tiếp
                                        </h2>
                                        <p className="mt-2 text-sm text-white/40">
                                            Sao chép các giá trị này vào OBS, bắt đầu phát, sau đó bấm Phát Trực Tiếp.
                                        </p>
                                    </div>
                                    <Wifi className="h-5 w-5 text-cyan-400" />
                                </div>
                                <div className="space-y-4">
                                    <CopyField
                                        label="URL RTMP"
                                        value={credentials.rtmpUrl}
                                        onCopy={() => copyToClipboard(credentials.rtmpUrl, 'URL RTMP')}
                                    />
                                    <CopyField
                                        label="Khóa Stream"
                                        value={credentials.streamKey}
                                        type="password"
                                        onCopy={() => copyToClipboard(credentials.streamKey, 'Khóa Stream')}
                                    />
                                </div>
                                <p className="mt-4 text-xs font-semibold text-pink-300/80">
                                    Giữ khóa stream của bạn bí mật. Coi nó như một mật khẩu.
                                </p>
                            </section>
                        )}

                        {/* Cài Đặt */}
                        <section className="rounded-2xl bg-[#171820] p-5 shadow-xl shadow-black/20">
                            <h2 className="mb-5 text-sm font-black uppercase tracking-[0.22em] text-white/45">
                                Cài Đặt Stream
                            </h2>
                            <div className="space-y-5">
                                <SettingRow
                                    icon={<MessageSquare className="h-5 w-5" />}
                                    title="Bật Chat"
                                    description="Cho phép người xem chat trong stream của bạn"
                                    checked={stream.isChatEnabled}
                                    onCheckedChange={(checked) => updateStream({ isChatEnabled: checked })}
                                    disabled={isLive}
                                />
                                <SettingRow
                                    icon={stream.isPublic ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                    title="Stream Công Khai"
                                    description="Làm cho stream này hiển thị trên trang duyệt"
                                    checked={stream.isPublic}
                                    onCheckedChange={(checked) => updateStream({ isPublic: checked })}
                                    disabled={isLive}
                                />
                            </div>
                        </section>

                        {/* Trạng thái dưới cùng */}

                    </main>

                    {/* Chat trực tiếp — sử dụng component chung với trang watch */}
                    <aside className="min-w-0">
                        {stream.isChatEnabled && isLive ? (
                            <StreamChat roomId={streamId} />
                        ) : (
                            <div className="flex min-h-[640px] items-center justify-center rounded-2xl bg-[#1e1f27] p-6 text-center">
                                <div>
                                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-white/25" />
                                    <p className="font-bold text-white/70">
                                        {stream.isChatEnabled
                                            ? 'Chat sẽ có sẵn khi stream đang phát trực tiếp'
                                            : 'Chat bị vô hiệu hóa'}
                                    </p>
                                    <p className="mt-1 text-sm text-white/40">
                                        {stream.isChatEnabled
                                            ? 'Bắt đầu stream để kết nối với phòng chat trực tiếp.'
                                            : 'Bật lại chat từ Cài Đặt Stream.'}
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

// ── Các sub-component (giữ nguyên, chỉ thêm disabled vào SettingRow) ────────

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
            {live ? 'Đang Phát' : 'Chờ'}
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
