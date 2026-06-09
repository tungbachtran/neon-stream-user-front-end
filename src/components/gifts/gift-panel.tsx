// src/components/gifts/gift-panel.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGiftCatalog, useGiftBalance, useSendGift } from '@/lib/hooks/use-gifts';
import { GiftItem } from '@/types/gift';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Diamond, Zap, Crown, Flame } from 'lucide-react';

interface GiftPanelProps {
    streamId: string;
    isOpen: boolean;
    onClose: () => void;
}

const RARITY_CONFIG = {
    COMMON: { label: 'Common', color: 'text-gray-400', bg: 'bg-gray-800', border: 'border-gray-600', icon: null },
    RARE: { label: 'Rare', color: 'text-blue-400', bg: 'bg-blue-950', border: 'border-blue-500', icon: Zap },
    EPIC: { label: 'Epic', color: 'text-purple-400', bg: 'bg-purple-950', border: 'border-purple-500', icon: Crown },
    LEGENDARY: { label: 'Legendary', color: 'text-yellow-400', bg: 'bg-yellow-950', border: 'border-yellow-500', icon: Flame },
};

const QUANTITY_OPTIONS = [1, 5, 10, 50, 99];

export function GiftPanel({ streamId, isOpen, onClose }: GiftPanelProps) {
    const { data: catalog = [] } = useGiftCatalog();
    const { data: balanceData } = useGiftBalance();
    const sendGift = useSendGift(streamId);

    const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<string>('ALL');

    const balance = balanceData?.balance ?? 0;
    const totalCost = selectedGift ? selectedGift.diamondCost * quantity : 0;
    const canAfford = balance >= totalCost;

    const filteredGifts =
        activeTab === 'ALL'
            ? catalog
            : catalog.filter((g) => g.rarity === activeTab);

    const handleSend = () => {
        if (!selectedGift || !canAfford) return;
        sendGift.mutate(
            { giftId: selectedGift.id, streamId, quantity },
            {
                onSuccess: () => {
                    // Subtle haptic-like feedback
                    setQuantity(1);
                },
            },
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute bottom-16 left-0 right-0 z-50 mx-4 w-[300px]"
                >
                    <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="text-white font-semibold text-sm">Send Gift</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-1">
                                <Diamond className="h-3.5 w-3.5 text-yellow-400" />
                                <span className="text-yellow-400 font-bold text-sm">
                                    {balance.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Rarity Tabs */}
                        <div className="px-4 pt-3">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="bg-white/5 h-8 gap-1">
                                    {['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'].map((tab) => (
                                        <TabsTrigger
                                            key={tab}
                                            value={tab}
                                            className={cn(
                                                'text-xs px-2 h-6 data-[state=active]:bg-white/15',
                                                tab !== 'ALL' && RARITY_CONFIG[tab as keyof typeof RARITY_CONFIG]?.color,
                                            )}
                                        >
                                            {tab === 'ALL' ? 'All' : RARITY_CONFIG[tab as keyof typeof RARITY_CONFIG]?.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Gift Grid */}
                        <div className="grid grid-cols-4 gap-2 p-4 max-h-48 overflow-y-auto">
                            {filteredGifts.map((gift) => {
                                const config = RARITY_CONFIG[gift.rarity];
                                const isSelected = selectedGift?.id === gift.id;
                                const affordable = balance >= gift.diamondCost;

                                return (
                                    <motion.button
                                        key={gift.id}
                                        whileTap={{ scale: 0.92 }}
                                        onClick={() => setSelectedGift(isSelected ? null : gift)}
                                        className={cn(
                                            'relative flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all duration-150',
                                            isSelected
                                                ? `${config.bg} ${config.border} ring-2 ring-offset-1 ring-offset-gray-900`
                                                : 'bg-white/5 border-white/10 hover:bg-white/10',
                                            !affordable && 'opacity-40 cursor-not-allowed',
                                        )}
                                        disabled={!affordable}
                                    >
                                        <span className="text-2xl leading-none">{gift.emoji}</span>
                                        <span className="text-white/80 text-[10px] font-medium truncate w-full text-center">
                                            {gift.name}
                                        </span>
                                        <div className="flex items-center gap-0.5">
                                            <Diamond className="h-2.5 w-2.5 text-yellow-400" />
                                            <span className="text-yellow-400 text-[10px] font-bold">
                                                {gift.diamondCost}
                                            </span>
                                        </div>
                                        {gift.rarity !== 'COMMON' && (
                                            <div
                                                className={cn(
                                                    'absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center',
                                                    config.bg,
                                                    config.border,
                                                    'border',
                                                )}
                                            >
                                                {config.icon && (
                                                    <config.icon className={cn('h-2.5 w-2.5', config.color)} />
                                                )}
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Quantity + Send */}
                        <div className="px-4 pb-4 space-y-3">
                            {/* Quantity selector */}
                            <div className="flex items-center gap-2">
                                <span className="text-white/50 text-xs">Qty:</span>
                                <div className="flex gap-1.5 flex-1">
                                    {QUANTITY_OPTIONS.map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => setQuantity(q)}
                                            className={cn(
                                                'flex-1 py-1 rounded-lg text-xs font-semibold border transition-all',
                                                quantity === q
                                                    ? 'bg-primary border-primary text-white'
                                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
                                            )}
                                        >
                                            {q === 99 ? '×99' : `×${q}`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Send button */}
                            <motion.div whileTap={{ scale: 0.97 }}>
                                <Button
                                    className={cn(
                                        'w-full h-11 rounded-xl font-bold text-sm transition-all',
                                        selectedGift && canAfford
                                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white shadow-lg shadow-pink-500/25'
                                            : 'bg-white/10 text-white/30 cursor-not-allowed',
                                    )}
                                    disabled={!selectedGift || !canAfford || sendGift.isPending}
                                    onClick={handleSend}
                                >
                                    {sendGift.isPending ? (
                                        <span className="flex items-center gap-2">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            Sending...
                                        </span>
                                    ) : selectedGift ? (
                                        <span className="flex items-center gap-2">
                                            Send {selectedGift.emoji} {selectedGift.name}
                                            <span className="flex items-center gap-1 bg-black/20 rounded-full px-2 py-0.5">
                                                <Diamond className="h-3 w-3 text-yellow-300" />
                                                <span className="text-yellow-300 text-xs">{totalCost.toLocaleString()}</span>
                                            </span>
                                        </span>
                                    ) : (
                                        'Select a gift'
                                    )}
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
