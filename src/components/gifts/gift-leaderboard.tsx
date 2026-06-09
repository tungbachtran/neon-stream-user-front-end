// src/components/gifts/gift-leaderboard.tsx
'use client';

import { motion } from 'framer-motion';
import { useLeaderboard } from '@/lib/hooks/use-gifts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Diamond, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const RANK_STYLES = [
    { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', medal: '🥇' },
    { bg: 'bg-gray-400/20', border: 'border-gray-400/40', text: 'text-gray-300', medal: '🥈' },
    { bg: 'bg-orange-600/20', border: 'border-orange-600/40', text: 'text-orange-400', medal: '🥉' },
];

export function GiftLeaderboard({ streamId }: { streamId: string }) {
    const { leaderboard } = useLeaderboard(streamId);

    if (leaderboard.length === 0) return null;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-white/80 text-sm font-semibold">Top Gifters</span>
            </div>

            <div className="space-y-1.5">
                {leaderboard.slice(0, 5).map((entry, idx) => {
                    const rankStyle = RANK_STYLES[idx] || {
                        bg: 'bg-white/5',
                        border: 'border-white/10',
                        text: 'text-white/60',
                        medal: `${idx + 1}`,
                    };

                    return (
                        <motion.div
                            key={entry.userId}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                                'flex items-center gap-2.5 px-3 py-2 rounded-xl border',
                                rankStyle.bg,
                                rankStyle.border,
                            )}
                        >
                            <span className="text-base w-5 text-center shrink-0">
                                {rankStyle.medal}
                            </span>
                            <Avatar className="h-7 w-7 shrink-0">
                                <AvatarImage src={entry.avatar || undefined} />
                                <AvatarFallback className="text-[10px] bg-gray-700">
                                    {entry.username[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-white text-xs font-medium flex-1 truncate">
                                {entry.username}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                                <Diamond className="h-3 w-3 text-yellow-400" />
                                <span className={cn('text-xs font-bold', rankStyle.text)}>
                                    {entry.totalDiamonds.toLocaleString()}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
