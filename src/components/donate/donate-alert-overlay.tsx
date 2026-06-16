'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond } from 'lucide-react';
import type { DonateTier } from '@/lib/api/donate';
import { cancelSpeech, speakVietnamese } from '@/lib/tts';
import { API_BASE_URL } from '@/lib/api/config';

interface DonateAlertPayload {
  txnId: string;
  sender: {
    id: string;
    username: string;
    avatar: string | null;
  };
  diamonds: number;
  tier: DonateTier;
  message: string | null;
  messageFlagged: boolean;
  createdAt: string;
}

interface DonateAlertOverlayProps {
  roomId: string;
}

const DISPLAY_DURATION: Record<DonateTier, number> = {
  BLUE: 4000,
  GREEN: 5000,
  YELLOW: 6000,
  ORANGE: 7000,
  RED: 8000,
};

const TIER_STYLES: Record<DonateTier, {
  gradient: string;
  border: string;
  nameColor: string;
  amountColor: string;
  glow: string;
}> = {
  BLUE: { gradient: 'from-blue-600/70 to-blue-900/70', border: 'border-blue-400/50', nameColor: 'text-blue-200', amountColor: 'text-blue-300', glow: 'shadow-blue-500/30' },
  GREEN: { gradient: 'from-green-600/70 to-green-900/70', border: 'border-green-400/50', nameColor: 'text-green-200', amountColor: 'text-green-300', glow: 'shadow-green-500/30' },
  YELLOW: { gradient: 'from-yellow-500/70 to-yellow-800/70', border: 'border-yellow-400/50', nameColor: 'text-yellow-200', amountColor: 'text-yellow-300', glow: 'shadow-yellow-500/40' },
  ORANGE: { gradient: 'from-orange-500/70 to-orange-800/70', border: 'border-orange-400/50', nameColor: 'text-orange-200', amountColor: 'text-orange-300', glow: 'shadow-orange-500/40' },
  RED: { gradient: 'from-red-500/70 to-red-900/70', border: 'border-red-400/60', nameColor: 'text-red-200', amountColor: 'text-red-300', glow: 'shadow-red-500/50' },
};

// ✅ Fix 1: Load voices một lần, cache lại
function getViVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'vi-VN') ??
    voices.find((v) => v.lang.startsWith('vi')) ??
    voices.find((v) => v.name.toLowerCase().includes('viet')) ??
    null
  );
}

export function DonateAlertOverlay({ roomId }: DonateAlertOverlayProps) {
  const [current, setCurrent] = useState<DonateAlertPayload | null>(null);
  const queueRef = useRef<DonateAlertPayload[]>([]);
  const isShowingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // ✅ Fix 2: Cache voices sau khi browser load xong
  const voicesReadyRef = useRef(false);
  const processQueueRef = useRef<() => void>(() => {});
  // ✅ Fix 1: Preload voices ngay khi component mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesReadyRef.current = true;
      }
    };

    loadVoices(); // thử ngay
    // Browser fire event này khi voices đã sẵn sàng
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // ── TTS ──────────────────────────────────────────────────────────────────
  const speak = useCallback((alert: DonateAlertPayload) => {
    const text = [
      `${alert.sender.username} đã donate ${alert.diamonds} kim cương`,
      alert.message ? `với lời nhắn: ${alert.message}` : '',
    ].filter(Boolean).join(', ');
  
    speakVietnamese(text, 'banmai'); // đổi voice tùy thích
  }, []);
  

  // ── Queue processor ───────────────────────────────────────────────────────
  const processQueue = useCallback(() => {
    if (isShowingRef.current || queueRef.current.length === 0) return;

    const next = queueRef.current.shift()!;
    isShowingRef.current = true;
    setCurrent(next);
    speak(next);

    const duration = DISPLAY_DURATION[next.tier] ?? 5000;
    timerRef.current = setTimeout(() => {
      setCurrent(null);
      isShowingRef.current = false;
      setTimeout(() => processQueueRef.current(), 600);
    }, duration);
  }, [speak]);
  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  // ── Socket ────────────────────────────────────────────────────────────────
  // ── Socket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket: Socket = io(
      `${API_BASE_URL}/donate`,
      { withCredentials: true, transports: ['websocket'] },
    );

    socket.on('donate_alert', (payload: DonateAlertPayload) => {
      console.log('🎁 [Overlay] donate_alert nhận được:', payload);
      queueRef.current.push(payload);
      processQueueRef.current();
    });
    processQueueRef.current = processQueue;

    socket.on('connect', () => {
      console.log('🔌 [Overlay] Socket connected, id:', socket.id);

      socket.emit('join_donate_room', { roomId }, (ack: any) => {
        console.log('🏠 [Overlay] Joined room ack:', ack, 'roomId:', roomId);


      });
    });

    socket.on('connect_error', (err) => {
      console.error('❌ [Overlay] Socket connect error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.warn('🔌 [Overlay] Socket disconnected:', reason);
    });

    socket.on('reconnect', () => {
      console.log('🔄 [Overlay] Reconnected, re-joining room');
      socket.emit('join_donate_room', { roomId });
    });

    return () => {
      socket.disconnect();
      cancelSpeech();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [roomId]);

  // ✅ Unlock TTS ngay khi user click bất kỳ đâu trên trang
useEffect(() => {
  const unlock = () => {
    if (!window.speechSynthesis) return;
    // Phát 1 utterance rỗng để "kích hoạt" engine
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
    console.log('🔓 TTS unlocked');
    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  return () => {
    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('keydown', unlock);
  };
}, []);


  if (!current) return null;

  const style = TIER_STYLES[current.tier];
  const displayMessage = current.messageFlagged 
    ? '⚠️ Lời nhắn không hợp lệ' 
    : current.message;
  return (
    <>

      <AnimatePresence>
        {current && (
          <motion.div
            key={current.txnId}
            initial={{ y: -60, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -60, opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="pointer-events-none absolute left-1/2 top-5 z-50 w-full max-w-md -translate-x-1/2 px-4"
          >
            <div className={`rounded-2xl border bg-gradient-to-br ${style.gradient} ${style.border} p-5 shadow-2xl ${style.glow} backdrop-blur-md`}>
              {(current.tier === 'RED' || current.tier === 'ORANGE') && (
                <div className="mb-3 flex justify-center">
                  <span className={`rounded-full bg-black/30 px-4 py-0.5 text-[10px] font-black uppercase tracking-widest ${style.amountColor}`}>
                    {current.tier === 'RED' ? '🔥 Donate Siêu Cấp' : '⚡ Donate Khủng'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black/40 text-xl font-black text-white">
                  {current.sender.username[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-base font-black ${style.nameColor}`}>
                    {current.sender.username}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Diamond className={`h-3.5 w-3.5 ${style.amountColor}`} />
                    <span className={`text-lg font-black ${style.amountColor}`}>
                      {current.diamonds.toLocaleString()} kim cương
                    </span>
                  </div>
                </div>
              </div>

              {displayMessage && (
              <div className="mt-4 rounded-xl bg-black/30 px-4 py-3">
                <p className={`text-sm leading-relaxed ${current.messageFlagged ? 'text-yellow-300' : 'text-white/90'}`}>
                  &ldquo;{displayMessage}&rdquo;
                </p>
              </div>
            )}

              <motion.div className="mt-4 h-1 overflow-hidden rounded-full bg-black/30">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${style.gradient}`}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{
                    duration: (DISPLAY_DURATION[current.tier] ?? 5000) / 1000,
                    ease: 'linear',
                  }}
                  style={{ transformOrigin: 'left', filter: 'brightness(2)' }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence></>
  );
}
