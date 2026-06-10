// src/components/check-in/daily-check-in-modal.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCheckInStatus, useCheckIn } from '@/lib/hooks/use-check-in';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Diamond, Flame, X, CheckCircle2, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppSelector } from '@/types/redux-type';

export function DailyCheckInModal() {
    const { user } = useAppSelector((state) => state.auth);
    const [open, setOpen] = useState(false);
    const [showReward, setShowReward] = useState(false);
    const [rewardData, setRewardData] = useState<{
        message: string;
        amount: number | null;
        emoji: string;
        streak: number;
    } | null>(null);

    const { data: status, isLoading } = useCheckInStatus();
    const checkIn = useCheckIn();

    // Auto-open nếu chưa điểm danh hôm nay
    useEffect(() => {
        if (!user || isLoading || !status) return;
        if (!status.hasCheckedInToday) {
            const timer = setTimeout(() => setOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [user, status, isLoading]);

    const handleCheckIn = async () => {
        checkIn.mutate(undefined, {
            onSuccess: (data) => {
                setRewardData({
                    message: data.message,
                    amount: data.reward.amount,
                    emoji: data.reward.emoji,
                    streak: data.streakCount,
                });
                setShowReward(true);

                // Confetti cho milestone 7 ngày
                if (data.streakCount % 7 === 0) {
                    confetti({
                        particleCount: 150,
                        spread: 80,
                        origin: { y: 0.6 },
                        colors: ['#FFD700', '#FF69B4', '#00CED1'],
                    });
                } else {
                    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
                }
            },
        });
    };

    if (!user || isLoading || !status) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-gray-900 border-white/10">
                <AnimatePresence mode="wait">
                    {!showReward ? (
                        // ── MAIN CHECK-IN VIEW ──
                        <motion.div
                            key="checkin"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            {/* Header */}
                            <div className="relative bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 px-6 pt-8 pb-6">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="absolute top-4 right-4 text-white/50 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="text-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="text-5xl mb-3"
                                    >
                                        🎁
                                    </motion.div>
                                    <h2 className="text-white text-2xl font-bold">
                                        Daily Check-in
                                    </h2>
                                    <p className="text-white/60 text-sm mt-1">
                                        Come back every day for bigger rewards!
                                    </p>

                                    {/* Streak badge */}
                                    {status.currentStreak > 0 && (
                                        <div className="inline-flex items-center gap-2 mt-3 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5">
                                            <Flame className="h-4 w-4 text-orange-400" />
                                            <span className="text-orange-300 font-bold text-sm">
                                                {status.currentStreak} Day Streak!
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Weekly Progress */}
                            <div className="px-6 py-5">
                                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
                                    Weekly Rewards
                                </p>
                                <div className="grid grid-cols-7 gap-1.5">
                                    {status.weeklyProgress.map((day) => (
                                        <DayCard key={day.day} day={day} />
                                    ))}
                                </div>
                            </div>

                            {/* Next Reward Preview */}
                            {!status.hasCheckedInToday && (
                                <div className="mx-6 mb-5 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
                                    <span className="text-2xl">{status.nextReward.emoji}</span>
                                    <div className="flex-1">
                                        <p className="text-white/60 text-xs">Today's reward</p>
                                        <p className="text-white font-bold text-sm">
                                            {status.nextReward.label}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Diamond className="h-4 w-4 text-yellow-400" />
                                        <span className="text-yellow-400 font-bold">
                                            +{status.nextReward.amount}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* CTA Button */}
                            <div className="px-6 pb-6">
                                {status.hasCheckedInToday ? (
                                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        <span className="text-green-400 font-semibold">
                                            Checked in today!
                                        </span>
                                    </div>
                                ) : (
                                    <motion.div whileTap={{ scale: 0.97 }}>
                                        <Button
                                            className="w-full h-12 rounded-xl font-bold text-base bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white shadow-lg shadow-pink-500/25"
                                            onClick={handleCheckIn}
                                            disabled={checkIn.isPending}
                                        >
                                            {checkIn.isPending ? (
                                                <span className="flex items-center gap-2">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                    />
                                                    Claiming...
                                                </span>
                                            ) : (
                                                '🎁 Claim Daily Reward'
                                            )}
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        // ── REWARD ANIMATION VIEW ──
                        <motion.div
                            key="reward"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="flex flex-col items-center justify-center py-12 px-6 text-center"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    rotate: [0, -10, 10, -10, 0],
                                }}
                                transition={{ duration: 0.6 }}
                                className="text-7xl mb-4"
                            >
                                {rewardData?.emoji}
                            </motion.div>

                            <h3 className="text-white text-2xl font-bold mb-2">
                                Reward Claimed!
                            </h3>

                            <div className="flex items-center gap-2 mb-3">
                                <Diamond className="h-6 w-6 text-yellow-400" />
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.3, type: 'spring' }}
                                    className="text-yellow-400 text-3xl font-black"
                                >
                                    +{rewardData?.amount}
                                </motion.span>
                            </div>

                            <div className="flex items-center gap-2 mb-6 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5">
                                <Flame className="h-4 w-4 text-orange-400" />
                                <span className="text-orange-300 font-bold text-sm">
                                    {rewardData?.streak} Day Streak!
                                </span>
                            </div>

                            <p className="text-white/60 text-sm mb-6">
                                {rewardData?.message}
                            </p>

                            <Button
                                className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white"
                                onClick={() => {
                                    setShowReward(false);
                                    setOpen(false);
                                }}
                            >
                                Awesome! 🎉
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}

// ── Day Card Sub-component ──
function DayCard({ day }: { day: ReturnType<typeof import('@/types/check-in').CheckInStatus['weeklyProgress'][0]['valueOf']> | any }) {
    return (
        <motion.div
            whileHover={day.isUpcoming ? {} : { scale: 1.05 }}
            className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all',
                day.isCompleted && 'bg-green-500/20 border-green-500/40',
                day.isCurrent && 'bg-pink-500/20 border-pink-500/60 ring-2 ring-pink-500/40',
                day.isUpcoming && 'bg-white/5 border-white/10 opacity-50',
            )}
        >
            <span className="text-xs text-white/50 font-medium">D{day.day}</span>
            <span className="text-lg leading-none">
                {day.isCompleted ? '✅' : day.isCurrent ? day.emoji : '🔒'}
            </span>
            <div className="flex items-center gap-0.5">
                <Diamond className="h-2 w-2 text-yellow-400" />
                <span className="text-yellow-400 text-[9px] font-bold">
                    {day.amount}
                </span>
            </div>
        </motion.div>
    );
}
