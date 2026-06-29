import { Button } from "@/components/ui/button";
import { Monitor, ChevronRight, Copy, Calendar, Radio, Settings, Play, RefreshCw, Square } from "lucide-react";

function StepCard({ number, title, description, children, borderClass, glowClass, badgeClass }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border bg-[linear-gradient(180deg,rgba(18,22,35,0.98),rgba(11,13,22,0.98))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)] ${borderClass}`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${glowClass} to-transparent opacity-60`} />
      <div className="relative flex gap-4">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black ${badgeClass}`}>
          {number}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.03em] text-white">
            {title}
          </h3>
          <p className="mt-2 max-w-[540px] text-sm leading-7 text-white/58 sm:text-[15px]">
            {description}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}

function MiniButton({ icon, label }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-black/35 px-4 py-3 text-sm font-semibold text-white/88 transition hover:bg-white/8">
      {icon}
      {label}
    </button>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-black/40 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
        {label}
      </div>
      <div className="mt-2 truncate text-base font-bold text-cyan-300">{value}</div>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-black/45 p-4 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
        {label}
      </div>
      <div className="mt-2 text-base font-black leading-tight text-white">{value}</div>
    </div>
  );
}

function ResourceItem({ icon, title, subtitle }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-2xl border border-white/6 bg-black/30 px-4 py-3 text-left transition hover:bg-white/6">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/15 bg-violet-400/10 text-violet-300">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-white">{title}</div>
        <div className="truncate text-xs text-white/45">{subtitle}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-white/35" />
    </button>
  );
}

function CopyField({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-black/40 p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35 mb-2">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 truncate text-sm font-bold text-cyan-300">{value}</div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10">
          <Copy className="h-3.5 w-3.5" />
          Sao chép
        </button>
      </div>
    </div>
  );
}

export default function StreamGuideSection() {
  return (
    <div className="bg-[#070b14] text-white">
      <div className="mx-auto max-w-[1400px] px-6 py-8 md:px-10 lg:px-12">

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[#050811] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_60px_rgba(46,84,255,0.08)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(59,130,246,0.09),transparent_18%),radial-gradient(circle_at_78%_30%,rgba(37,99,235,0.08),transparent_22%),linear-gradient(90deg,rgba(3,7,18,0.96)_0%,rgba(3,7,18,0.88)_42%,rgba(3,7,18,0.62)_68%,rgba(3,7,18,0.84)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02),transparent_16%,transparent_84%,rgba(255,255,255,0.015))]" />

          <div className="relative grid min-h-[620px] items-center lg:grid-cols-[1.05fr_0.95fr]">
            {/* Trái */}
            <div className="z-10 px-8 py-12 sm:px-12 md:px-14 lg:px-16 lg:py-16">
              <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
                Hướng dẫn thiết lập
              </div>

              <h1 className="mt-8 max-w-[680px] text-5xl font-black leading-[0.92] tracking-[-0.04em] text-white sm:text-6xl lg:text-[5.6rem]">
                Thiết Lập
                <br />
                Stream: <span className="text-violet-300">OBS</span>
                <br />
                <span className="bg-gradient-to-r from-violet-300 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Hướng Dẫn Chi Tiết
                </span>
              </h1>

              <p className="mt-8 max-w-[640px] text-lg leading-9 text-white/68 md:text-[1.55rem]">
                Làm theo 7 bước đơn giản dưới đây để bắt đầu buổi livestream đầu tiên của bạn —
                từ tạo phòng stream, kết nối OBS cho đến khi lên sóng thành công.
              </p>

              <div className="mt-12">
                <Button className="h-auto rounded-2xl bg-gradient-to-r from-violet-300 to-violet-500 px-8 py-6 text-lg font-bold text-black shadow-[0_18px_40px_rgba(139,92,246,0.34)] transition hover:scale-[1.02] hover:from-violet-200 hover:to-violet-400">
                  Bắt đầu ngay
                </Button>
              </div>
            </div>

            {/* Phải — trang trí */}
            <div className="relative hidden min-h-[620px] lg:block">
              <div className="absolute inset-y-0 right-0 w-full bg-[radial-gradient(circle_at_60%_42%,rgba(59,130,246,0.12),transparent_18%),radial-gradient(circle_at_72%_55%,rgba(15,23,42,0.18),transparent_30%)]" />
              <div className="absolute bottom-[86px] left-[18px] h-[340px] w-[180px] rounded-[32px] border border-white/6 bg-gradient-to-b from-[#0e1118]/95 to-[#070a11]/95 shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
                <div className="absolute left-1/2 top-6 h-4 w-16 -translate-x-1/2 rounded-full bg-white/6" />
              </div>
              <div className="absolute bottom-[78px] left-[138px] h-[210px] w-[470px] rotate-[5deg] rounded-[24px] border border-white/6 bg-[#090d15]/95 shadow-[0_35px_90px_rgba(0,0,0,0.52)]" />
              <div className="absolute bottom-[118px] left-[218px] h-[292px] w-[338px] rounded-[20px] border border-white/6 bg-gradient-to-b from-[#0d1320]/95 to-[#080b12]/95 shadow-[0_30px_90px_rgba(0,0,0,0.56)]">
                <div className="absolute left-1/2 top-5 h-2.5 w-20 -translate-x-1/2 rounded-full bg-white/6" />
                <div className="absolute inset-x-5 bottom-5 top-12 rounded-[12px] bg-[linear-gradient(90deg,rgba(17,24,39,0.98),rgba(11,18,32,0.88),rgba(17,24,39,0.98))]">
                  <div className="absolute inset-0 rounded-[12px] bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.09),transparent_32%)]" />
                </div>
              </div>
              <div className="absolute bottom-[72px] right-[46px] h-[118px] w-[118px] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.2),rgba(82,82,91,0.2)_34%,rgba(10,10,12,0.98)_72%)] shadow-[0_12px_32px_rgba(0,0,0,0.55)]" />
              <div className="absolute bottom-[84px] right-[16px] h-[66px] w-[80px] rotate-[16deg] rounded-full border border-white/6 bg-[#0d1017] shadow-[0_12px_30px_rgba(0,0,0,0.4)]" />
            </div>
          </div>
        </div>

        {/* ── Các bước ── */}
        <div className="mt-8 space-y-5">

          {/* Bước 1 */}
          <StepCard
            number="01"
            borderClass="border-violet-400/20"
            glowClass="from-violet-400/8"
            badgeClass="from-violet-300 to-violet-500 text-[#14091f]"
            title="Tạo buổi livestream mới"
            description="Vào mục Thiết lập Livestream và tạo một buổi phát mới. Sau khi tạo xong, sao chép đường dẫn RTMP và khoá stream được cấp — bạn sẽ cần dùng chúng ở bước tiếp theo."
          >
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <CopyField label="Đường dẫn RTMP" value="rtmp://live.neonstream.io/app" />
              <CopyField label="Khoá stream" value="sk_live_xxxxxxxxxxxxxxxx" />
            </div>
          </StepCard>

          {/* Bước 2 */}
          <StepCard
            number="02"
            borderClass="border-cyan-400/20"
            glowClass="from-cyan-400/8"
            badgeClass="from-cyan-300 to-sky-400 text-[#07141b]"
            title="Tải & cài đặt OBS Studio"
            description="Tải OBS Studio hoặc bất kỳ phần mềm phát trực tiếp nào hỗ trợ giao thức RTMP. Đảm bảo cài đúng phiên bản chính thức phù hợp với hệ điều hành của bạn."
          >
            <div className="mt-6 flex flex-wrap gap-3">
              <MiniButton icon={<Monitor className="h-4 w-4" />} label="Tải cho Windows" />
              <MiniButton icon={<Monitor className="h-4 w-4" />} label="Tải cho macOS" />
            </div>
          </StepCard>

          {/* Bước 3 */}
          <StepCard
            number="03"
            borderClass="border-pink-400/20"
            glowClass="from-pink-400/8"
            badgeClass="from-pink-300 to-rose-500 text-[#1d0a14]"
            title="Kết nối OBS với nền tảng"
            description="Mở OBS, vào File → Settings → Stream. Tại mục Service, chọn Custom. Dán đường dẫn RTMP vào ô Server và khoá stream vào ô Stream Key, sau đó nhấn Apply để lưu."
          >
            <div className="mt-6 rounded-[18px] border border-white/6 bg-black/30 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-4 w-4 text-white/40" />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-white/40">File → Settings → Stream</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoTile label="Service" value="Custom..." />
                <InfoTile label="Server" value="rtmp://live.neonstream..." />
                <InfoTile label="Stream Key" value="sk_live_xxxxxxxx..." />
              </div>
            </div>
          </StepCard>

          {/* Bước 4 */}
          <StepCard
            number="04"
            borderClass="border-violet-400/20"
            glowClass="from-violet-400/8"
            badgeClass="from-violet-300 to-violet-500 text-[#14091f]"
            title="Thiết lập Scene & Source, rồi bắt đầu stream"
            description="Thêm các nguồn hình ảnh và âm thanh vào Scene: webcam, microphone, cửa sổ game hoặc màn hình. Khi mọi thứ đã sẵn sàng, nhấn nút Start Streaming trong OBS để bắt đầu phát."
          >
            <div className="mt-6 flex h-[220px] items-center justify-center rounded-[18px] border border-white/6 bg-[radial-gradient(circle_at_50%_30%,rgba(251,191,36,0.08),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]">
              <div className="text-center">
                <div className="text-6xl font-black tracking-[-0.06em] text-[#9cb3ff]">OBS</div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]">
                  <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-cyan-300">
                    Webcam đang bật
                  </span>
                  <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-violet-300">
                    Game Capture bật
                  </span>
                  <span className="rounded-full border border-green-400/25 bg-green-400/10 px-3 py-1 text-green-300">
                    Microphone bật
                  </span>
                </div>
                <div className="mt-5">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-5 py-2.5 text-sm font-bold text-black shadow-[0_8px_24px_rgba(52,211,153,0.3)]">
                    <Play className="h-4 w-4" />
                    Start Streaming
                  </button>
                </div>
              </div>
            </div>
          </StepCard>

          {/* Bước 5 */}
          <StepCard
            number="05"
            borderClass="border-green-400/20"
            glowClass="from-green-400/8"
            badgeClass="from-green-300 to-emerald-500 text-[#071a0f]"
            title="Làm mới trang quản lý để lên sóng"
            description="Quay lại giao diện quản lý buổi livestream và nhấn Làm mới. Hệ thống sẽ nhận tín hiệu từ OBS và chuyển trạng thái buổi live sang Đang phát — khán giả có thể xem ngay lúc này."
          >
            <div className="mt-6 flex flex-wrap gap-3">
              <MiniButton icon={<RefreshCw className="h-4 w-4" />} label="Làm mới trang" />
              <div className="inline-flex items-center gap-2 rounded-xl border border-green-400/20 bg-green-400/8 px-4 py-3 text-sm font-semibold text-green-300">
                <Radio className="h-4 w-4" />
                Trạng thái: Đang phát
              </div>
            </div>
          </StepCard>

          {/* Bước 6 — placeholder nếu cần, hoặc bỏ qua theo yêu cầu */}

          {/* Bước 7 */}
          <StepCard
            number="07"
            borderClass="border-rose-400/20"
            glowClass="from-rose-400/8"
            badgeClass="from-rose-300 to-red-500 text-[#1d0808]"
            title="Dừng buổi livestream"
            description="Khi muốn kết thúc, quay lại OBS và nhấn Stop Streaming. Tín hiệu sẽ ngắt kết nối và buổi live tự động chuyển sang trạng thái Đã kết thúc trên hệ thống."
          >
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(244,63,94,0.3)] transition hover:from-rose-400 hover:to-red-500">
                <Square className="h-4 w-4" />
                Stop Streaming
              </button>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-black/35 px-4 py-3 text-sm font-semibold text-white/50">
                <Radio className="h-4 w-4" />
                Trạng thái: Đã kết thúc
              </div>
            </div>
          </StepCard>

        </div>

      </div>
    </div>
  );
}
