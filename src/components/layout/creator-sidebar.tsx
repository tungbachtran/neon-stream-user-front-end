// components/creator-sidebar.tsx
"use client";

import {
  BarChart3,
  Grid2X2,
  HelpCircle,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Stream Manager",
    icon: Video,
    active: true,
  },
  {
    label: "Analytics",
    icon: BarChart3,
  },
  {
    label: "Community",
    icon: Users,
  },
  {
    label: "Settings",
    icon: Settings,
  },
];

export function CreatorSidebar() {
  return (
    <aside className="flex h-full w-[240px] flex-col border-r border-white/5 bg-[#15151a] text-zinc-300">
      <div className="px-6 pt-6">
        <div className="text-xl font-black tracking-tight text-violet-300 drop-shadow-[0_0_10px_rgba(167,139,250,0.6)]">
          NEON_NOIR
        </div>
      </div>

      <div className="mt-8 px-5">
        <div className="flex items-center gap-3 rounded-xl">
          <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
            <Video className="size-5" />
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              Creator Studio
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-rose-500" />
              <span className="text-[10px] font-bold uppercase text-rose-400">
                Live Now
              </span>
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-8 space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className={cn(
                "group relative flex h-12 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium transition",
                item.active
                  ? "bg-violet-500/10 text-violet-300"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>

              {item.active && (
                <span className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-5 px-5 pb-7">
        <Button className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-400 to-violet-600 font-bold text-zinc-950 shadow-[0_0_24px_rgba(139,92,246,0.35)] hover:from-violet-300 hover:to-violet-500">
          Go Live
        </Button>

        <div className="space-y-3 text-sm text-zinc-500">
          <button className="flex items-center gap-3 transition hover:text-zinc-200">
            <HelpCircle className="size-4" />
            Help
          </button>

          <button className="flex items-center gap-3 transition hover:text-zinc-200">
            <ShieldCheck className="size-4" />
            Legal
          </button>
        </div>
      </div>
    </aside>
  );
}
