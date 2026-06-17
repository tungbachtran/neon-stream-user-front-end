// src/components/gifts/gift-animation-overlay.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGiftEvents } from '@/lib/hooks/use-gifts';
import { GiftEvent } from '@/types/gift';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Diamond } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GiftAnimationOverlayProps {
  streamId: string;
}

const RARITY_STYLES = {
  COMMON:    { gradient: 'from-gray-500 to-gray-600',     glow: 'shadow-gray-500/50',   size: 'text-4xl' },
  RARE:      { gradient: 'from-blue-500 to-cyan-500',     glow: 'shadow-blue-500/50',   size: 'text-5xl' },
  EPIC:      { gradient: 'from-purple-500 to-pink-500',   glow: 'shadow-purple-500/50', size: 'text-6xl' },
  LEGENDARY: { gradient: 'from-yellow-400 to-orange-500', glow: 'shadow-yellow-500/50', size: 'text-7xl' },
};

function GiftNotification({
  event,
}: {
  event: GiftEvent & { uid: string };
}) {
  const style = RARITY_STYLES[event.gift.rarity as keyof typeof RARITY_STYLES];
  const isLegendary = event.gift.rarity === 'LEGENDARY';
  const isCombo = event.comboCount > 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -80, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -80, scale: 0.8 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="pointer-events-none"
    >
      <div
        className={cn(
          'relative flex items-center gap-3 rounded-2xl px-4 py-3 max-w-xs',
          'bg-black/70 backdrop-blur-md border border-white/10',
          isLegendary && `shadow-2xl ${style.glow}`,
        )}
      >
        {/* Legendary shimmer border */}
        {isLegendary && (
          <motion.div
            className={cn(
              'absolute inset-0 rounded-2xl bg-gradient-to-r opacity-20',
              style.gradient,
            )}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}

        {/* Avatar */}
        <Avatar className="h-9 w-9 border-2 border-white/20 shrink-0">
          <AvatarImage src={event.sender.avatar || undefined} />
          <AvatarFallback className="text-xs bg-gray-700">
            {event.sender.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate">
            {event.sender.username}
          </p>
          <p className="text-white/60 text-[11px]">
            sent{' '}
            <span className="text-white font-medium">{event.gift.name}</span>
            {event.quantity > 1 && (
              <span className="text-white/80"> ×{event.quantity}</span>
            )}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Diamond className="h-3 w-3 text-yellow-400" />
            <span className="text-yellow-400 text-[11px] font-bold">
              {event.totalDiamonds.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Gift emoji + combo */}
        <div className="relative shrink-0">
          <motion.span
            className={cn('block', style.size)}
            animate={
              isLegendary
                ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }
                : { scale: [1, 1.15, 1] }
            }
            transition={{ duration: 0.5 }}
          >
            {event.gift.emoji}
          </motion.span>

          {/* Combo badge */}
          {isCombo && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                'absolute -top-2 -right-2 min-w-[20px] h-5 rounded-full',
                'flex items-center justify-center px-1',
                'bg-gradient-to-r text-white text-[10px] font-black',
                style.gradient,
              )}
            >
              ×{event.comboCount}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function GiftAnimationOverlay({ streamId }: GiftAnimationOverlayProps) {
  const { activeGifts } = useGiftEvents(streamId);

  return (
    <div className="absolute left-10 bottom-10 z-40 space-y-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {activeGifts.slice(-5).map((event) => (
          <GiftNotification key={event.uid} event={event} />
        ))}
      </AnimatePresence>
    </div>
  );
}
