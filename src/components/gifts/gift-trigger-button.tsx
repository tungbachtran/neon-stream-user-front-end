// src/components/gifts/gift-trigger-button.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GiftPanel } from './gift-panel';

import { cn } from '@/lib/utils';
import { useAppSelector } from '@/types/redux-type';

interface GiftTriggerButtonProps {
  streamId: string;
  className?: string;
}

export function GiftTriggerButton({ streamId, className }: GiftTriggerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  return (
    <div className="relative">
      <GiftPanel
        streamId={streamId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />

      <motion.div whileTap={{ scale: 0.9 }}>
        <Button
          size="sm"
          onClick={() => setIsOpen((v) => !v)}
          className={cn(
            'gap-2 rounded-full font-semibold',
            isOpen
              ? 'bg-pink-500 hover:bg-pink-400 text-white'
              : 'bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/30',
            className,
          )}
        >
          <motion.span
            animate={isOpen ? { rotate: [0, -20, 20, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Gift className="h-4 w-4" />
          </motion.span>
          Gift
        </Button>
      </motion.div>
    </div>
  );
}
