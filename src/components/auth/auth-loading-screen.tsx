// src/components/auth/auth-loading-screen.tsx
'use client';

import { Radio } from 'lucide-react';

export function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#08080d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(124,58,237,0.22),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(34,211,238,0.16),transparent_35%)]" />

      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:90px_90px]" />

      <div className="relative flex flex-col items-center">
        <div className="relative mb-10 flex h-28 w-28 items-center justify-center">
          <div className="absolute h-20 w-20 rotate-45 rounded-2xl border border-cyan-300/50 shadow-[0_0_35px_rgba(34,211,238,0.35)] animate-spin-slow" />
          <div className="absolute h-24 w-24 rotate-45 rounded-2xl border border-violet-400/40 animate-pulse" />

          <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_0_45px_rgba(124,58,237,0.65)]">
            <Radio className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>

        <h1 className="text-xl font-semibold tracking-tight">
          Đang xác thực tài khoản của bạn
          <span className="ml-2 inline-flex gap-1 text-cyan-300">
            <span className="animate-bounce">.</span>
            <span className="animate-bounce [animation-delay:150ms]">.</span>
            <span className="animate-bounce [animation-delay:300ms]">.</span>
          </span>
        </h1>

        <p className="mt-4 text-xs uppercase tracking-widest text-white/35">
          Thiết lập nút phát trực tiếp được mã hóa...
        </p>

        <div className="mt-24 h-[2px] w-52 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-loading-bar bg-gradient-to-r from-violet-400 to-cyan-300" />
        </div>

        <div className="mt-10 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-[10px] uppercase tracking-[0.35em] text-white/45">
          Giao Thức Bảo Mật NeonStream Đang Hoạt Động
        </div>
      </div>
    </div>
  );
}
