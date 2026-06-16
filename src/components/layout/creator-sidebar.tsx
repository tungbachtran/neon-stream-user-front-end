// components/creator-sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
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
    href: "/stream/dashboard",
  },
  {
    label: "Hướng dẫn livestream",
    icon: Video,
    href: "/stream/stream-guide",
  },
  {
    label: "Thiết lập livestream",
    icon: BarChart3,
    href: "/stream/stream-setup",
  },
];

export function CreatorSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <aside className="flex h-screen w-[240px] flex-col border-r border-white/5 bg-[#15151a] text-zinc-300 pt-6">
      <div className="px-6 pt-6">

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
          const active = isActive(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group relative flex h-12 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium transition",
                active
                  ? "bg-violet-500/10 text-violet-300"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>

              {active && (
                <span className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
