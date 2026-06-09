// src/components/donate/donate-chat-bubble.tsx
'use client';

import { motion }      from 'framer-motion';
import { Diamond }     from 'lucide-react';
import type { DonateTier } from '@/lib/api/donate';

interface DonateChatBubbleProps {
  senderUsername: string;
  diamonds:       number;
  tier:           DonateTier;
  message:        string | null;
  createdAt:      string;
}

const BUBBLE_STYLES: Record<DonateTier, {
  border:   string;
  bg:       string;
  name:     string;
  amount:   string;
  label:    string;
}> = {
  BLUE:   { border: 'border-blue-400/30',   bg: 'bg-blue-500/10',   name: 'text-blue-300',   amount: 'text-blue-400',   label: '' },
  GREEN:  { border: 'border-green-400/30',  bg: 'bg-green-500/10',  name: 'text-green-300',  amount: 'text-green-400',  label: '' },
  YELLOW: { border: 'border-yellow-400/30', bg: 'bg-yellow-500/10', name: 'text-yellow-300', amount: 'text-yellow-400', label: '⭐' },
  ORANGE: { border: 'border-orange-400/30', bg: 'bg-orange-500/10', name: 'text-orange-300', amount: 'text-orange-400', label: '⚡' },
  RED:    { border: 'border-red-400/40',    bg: 'bg-red-500/15',    name: 'text-red-300',    amount: 'text-red-400',    label: '🔥' },
};

export function DonateChatBubble({
  senderUsername,
  diamonds,
  tier,
  message,
  createdAt,
}: DonateChatBubbleProps) {
  const s = BUBBLE_STYLES[tier];

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl border p-3 ${s.border} ${s.bg}`}
    >
      {/* Header: tên + số kim cương */}
      <div className="flex items-center justify-between gap-2">
        <span className={`truncate text-sm font-black ${s.name}`}>
          {s.label && <span className="mr-1">{s.label}</span>}
          {senderUsername}
        </span>
        <span className={`flex shrink-0 items-center gap-1 text-xs font-black ${s.amount}`}>
          <Diamond className="h-3 w-3" />
          {diamonds.toLocaleString()}
        </span>
      </div>

      {/* Message */}
      {message && (
        <p className="mt-1.5 text-xs leading-relaxed text-white/75">
          {message}
        </p>
      )}
    </motion.div>
  );
}
