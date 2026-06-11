// components/stream-setup.tsx
"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Eye,
  Globe2,
  Grid2X2,
  Heart,
  ImagePlus,
  Play,
  Plus,
  SlidersHorizontal,
  Upload,
  UserRound,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/ui/icons";
import { useStreams } from "@/lib/hooks/use-streams";
import { useUpload } from "@/lib/hooks/use-upload";
import { useAppSelector } from "@/types/redux-type";
import { streamsApi } from "@/lib/api/streams";
import { toast } from "sonner";

const categories = [
  "Just Chatting",
  "Gaming",
  "Music",
  "Art",
  "Esports",
  "IRL",
  "Tech",
  "Education",
];

const languages = ["English", "Vietnamese", "Japanese", "Korean", "French"];

export default function StreamSetup() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { uploadImage, isUploading } = useUpload();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Just Chatting");
  const [language, setLanguage] = useState("English");
  const [tags, setTags] = useState(["NoMic", "Chill"]);

  // thumbnailFile: file thực để upload lên MinIO khi submit
  // thumbnailPreview: object URL để preview ngay lập tức
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStream, setIsCheckingStream] = useState(true);

  // ── Khi mount: check xem user đã có stream chưa ──────────────────────
  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const myStreams = await streamsApi.getMyStreams();
        if (myStreams && myStreams.length > 0) {
          // Đã có stream → navigate thẳng sang manager
          router.replace(`/stream/${myStreams[0].id}`);
          return;
        }
      } catch {
        // Không có stream hoặc lỗi → hiển thị form tạo bình thường
      } finally {
        setIsCheckingStream(false);
      }
    })();
  }, [user, router]);

  const previewTitle = useMemo(
    () => title.trim() || "UNSET TITLE",
    [title]
  );

  function handleThumbnailUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Revoke URL cũ để tránh memory leak
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  function removeTag(tag: string) {
    setTags((cur) => cur.filter((t) => t !== tag));
  }

  function addTag() {
    setTags((cur) => {
      if (cur.length >= 5) return cur;
      return [...cur, `Tag${cur.length + 1}`];
    });
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề stream");
      return;
    }
    if (!user) return;

    setIsSubmitting(true);

    try {
      let thumbnailUrl: string | undefined;

      // Upload thumbnail lên MinIO trước khi tạo stream
      if (thumbnailFile) {
        try {
          thumbnailUrl = await uploadImage(thumbnailFile, "thumbnail");
        } catch {
          toast.error("Upload thumbnail thất bại, stream vẫn được tạo không có ảnh.");
        }
      }

      const stream = await streamsApi.createStream({
        title: title.trim(),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
      });

      toast.success("Stream đã được tạo!");
      router.push(`/stream/${stream.id}`);
    } catch (err: any) {
      toast.error("Tạo stream thất bại", {
        description: err?.message || "Đã có lỗi xảy ra",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Loading state khi đang check stream ──────────────────────────────
  if (isCheckingStream) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090d]">
        <Icons.spinner className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  const isBusy = isSubmitting || isUploading;

  return (
    <main className="min-h-screen flex-1 overflow-hidden bg-[radial-gradient(circle_at_55%_70%,rgba(20,184,166,0.08),transparent_28%),linear-gradient(135deg,#0b0b10_0%,#111018_45%,#08090c_100%)] text-zinc-100">
      <header className="flex h-16 items-center justify-between border-b border-white/5 px-14">
        <nav className="flex items-center gap-7 text-sm font-semibold text-zinc-500">
          <button className="transition hover:text-zinc-100">Discover</button>
          <button className="transition hover:text-zinc-100">Browse</button>
          <button className="transition hover:text-zinc-100">Esports</button>
        </nav>

        <div className="flex items-center gap-5">
          <button className="text-zinc-500 transition hover:text-zinc-100">
            <Bell className="size-5" />
          </button>
          <button className="text-zinc-500 transition hover:text-zinc-100">
            <Grid2X2 className="size-5" />
          </button>
          <Avatar className="size-9 border border-violet-400/30">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop" />
            <AvatarFallback>NN</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <section className="px-14 py-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-100">
            STREAM SETUP
          </h1>
          <p className="mt-2 text-sm font-medium text-zinc-500">
            Configure your broadcast parameters for maximum engagement.
          </p>
        </div>

        <div className="mt-10 grid max-w-[980px] grid-cols-[1fr_280px] gap-8">
          <Card className="border-white/5 bg-[#17171c]/95 p-7 shadow-2xl shadow-black/40">
            <div className="mb-7 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-violet-300">
                Set Up Your Broadcast
              </h2>
              <button className="text-zinc-500 transition hover:text-zinc-100">
                <SlidersHorizontal className="size-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Stream Title
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What are you streaming today?"
                  className="h-13 rounded-xl border-white/5 bg-[#27272d] px-4 font-medium text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-violet-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-13 rounded-xl border-white/5 bg-[#27272d] px-4 text-zinc-100 focus:ring-violet-500/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#1d1d24] text-zinc-100">
                      {categories.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-13 rounded-xl border-white/5 bg-[#27272d] px-4 text-zinc-100 focus:ring-violet-500/50">
                      <div className="flex items-center gap-2">
                        <SelectValue placeholder="Select language" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#1d1d24] text-zinc-100">
                      {languages.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Stream Tags{" "}
                  <span className="tracking-normal text-zinc-600">
                    Optional
                  </span>
                </Label>
                <div className="flex flex-wrap items-center gap-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={tag}
                      className={
                        index === 0
                          ? "gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/15"
                          : "gap-1.5 rounded-full bg-violet-500/10 px-3 py-1.5 text-violet-300 hover:bg-violet-500/15"
                      }
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="opacity-70 transition hover:opacity-100"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    onClick={addTag}
                    className="h-8 rounded-full bg-white/7 px-3 text-xs font-bold text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
                  >
                    <Plus className="mr-1 size-3.5" />
                    Add Tag
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_120px] gap-4 pt-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isBusy}
                  className="h-13 rounded-xl bg-gradient-to-r from-violet-400 to-violet-600 font-black text-zinc-950 shadow-[0_0_24px_rgba(139,92,246,0.32)] hover:from-violet-300 hover:to-violet-500 disabled:opacity-60"
                >
                  {isBusy ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading ? "Uploading..." : "Creating..."}
                    </>
                  ) : (
                    "Go to Manager"
                  )}
                </Button>
                <Button
                  variant="secondary"
                  disabled={isBusy}
                  className="h-13 rounded-xl bg-[#28282f] font-bold text-zinc-300 hover:bg-[#32323a] hover:text-zinc-100"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>

          <aside className="space-y-5">
            <Card className="overflow-hidden border-white/5 bg-[#17171c] shadow-2xl shadow-black/40">
              <div className="group relative h-[145px] overflow-hidden bg-[#202026]">
                <img
                  src={
                    thumbnailPreview ||
                    "https://images.unsplash.com/photo-1519608487953-e999c86e7455?q=80&w=900&auto=format&fit=crop"
                  }
                  alt="Stream thumbnail preview"
                  className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-60"
                />

                <div className="absolute left-3 top-3 rounded-md bg-rose-500 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  Preview
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute left-1/2 top-3 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/65 px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-violet-500 group-hover:flex"
                >
                  <Upload className="size-4" />
                  Upload thumbnail
                </button>

                <button className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-sm transition group-hover:scale-105">
                  <Play className="ml-1 size-6 fill-white" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
              </div>

              <div className="p-4">
                <div className="flex gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
                    <UserRound className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black uppercase text-zinc-100">
                      {previewTitle}
                    </h3>
                    <p className="mt-0.5 text-xs font-bold uppercase text-zinc-500">
                      {category}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Eye className="size-3.5" />0
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="size-3.5" />0
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-zinc-600">
                    <Globe2 className="size-3.5" />
                    {language}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="border-cyan-400/10 bg-cyan-500/[0.06] p-5 shadow-[0_0_28px_rgba(6,182,212,0.06)]">
              <div className="flex gap-3">
                <div className="mt-1 text-cyan-300">
                  <ImagePlus className="size-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wide text-cyan-300">
                    Creator Tip
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-zinc-400">
                    Streams with descriptive titles and at least 3 relevant tags
                    see a{" "}
                    <span className="font-bold text-zinc-200">
                      24% higher discovery rate
                    </span>{" "}
                    in the Browse tab.
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
