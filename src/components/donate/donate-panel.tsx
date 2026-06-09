// src/components/donate/donate-panel.tsx
'use client';

import { useState }                    from 'react';
import { motion, AnimatePresence }     from 'framer-motion';
import { X, Diamond, Send, Zap }       from 'lucide-react';
import { Button }                      from '@/components/ui/button';
import { Textarea }                    from '@/components/ui/textarea';
import { Input }                       from '@/components/ui/input';
import { useMutation }                 from '@tanstack/react-query';
import { donateApi, DONATE_PRESETS, SendDonateResponse }   from '@/lib/api/donate';
import { useAppSelector }              from '@/types/redux-type';
import { v4 as uuidv4 }               from 'uuid';
import { toast }                       from 'sonner';
import { useGiftBalance } from '@/lib/hooks/use-gifts';

interface DonatePanelProps {
  streamId: string;
  onClose:  () => void;
}

export function DonatePanel({ streamId, onClose }: DonatePanelProps) {
  const { user }          = useAppSelector((s) => s.auth);
  const [diamonds, setDiamonds] = useState<number>(50);
  const [custom, setCustom]     = useState('');
  const [message, setMessage]   = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const activeDiamonds = useCustom
    ? Math.max(50, Math.min(100_000, Number(custom) || 50))
    : diamonds;
  const {data:balance} = useGiftBalance()
  // Tìm tier hiện tại
  const activeTier = DONATE_PRESETS.slice()
    .reverse()
    .find((p) => activeDiamonds >= p.diamonds) ?? DONATE_PRESETS[0];

  const canAfford  = (balance?.balance ?? 0) >= activeDiamonds;
  const canSubmit  = message.trim().length > 0 && canAfford;

  // src/components/donate/donate-panel.tsx
const mutation = useMutation({
  mutationFn: donateApi.sendDonate,
  onSuccess: (data: SendDonateResponse) => {  // ✅ giờ data đã là SendDonateResponse
    if (data.duplicate) {
      toast.info('Donate đã được gửi trước đó');
    } else {
      toast.success(
        `💎 Đã donate ${data.diamonds?.toLocaleString()} kim cương! Còn lại ${data.remainingBalance?.toLocaleString()} 💎`,
      );
    }
    onClose();
  },
  onError: (err: any) => {
    // Axios error shape: err.response.data.message
    const msg =
      err?.response?.data?.message ??
      err?.message ??
      'Donate thất bại';
    toast.error(msg);
  },
});


  const handleSend = () => {
    if (!canSubmit || !user) return;
    mutation.mutate({
      streamId,
      diamonds:        activeDiamonds,
      message:         message.trim(),
      idempotencyKey:  uuidv4(),
    });
  };

  const testTTS = async () => {
    const { speakVietnamese } = await import('@/lib/tts');
    await speakVietnamese('Xin chào, test giọng nói tiếng Việt thành công!', 'banmai');
  };
  
  

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 80, opacity: 0, scale: 0.97 }}
          animate={{ y: 0,  opacity: 1, scale: 1 }}
          exit={{ y: 80,    opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="w-full max-w-md rounded-t-3xl bg-[#1a1a22] p-6 shadow-2xl sm:rounded-3xl"
        >
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <h2 className="text-lg font-black text-white">Super Donate</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-[#2a2a35] px-3 py-1.5 text-sm font-bold text-yellow-400">
                <Diamond className="h-3.5 w-3.5" />
                {balance?.balance?.toLocaleString() ?? 0}
              </span>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/60 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Tier preview ───────────────────────────────────────────── */}
          <div
            className={`mb-5 rounded-2xl border p-4 transition-all duration-300 ${activeTier.bgColor} ${activeTier.borderColor}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Donate của bạn
                </p>
                <p className={`text-2xl font-black ${activeTier.color}`}>
                  💎 {activeDiamonds.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40">Tier</p>
                <p className={`text-sm font-black ${activeTier.color}`}>
                  {activeTier.tier}
                </p>
              </div>
            </div>
          </div>

          {/* ── Preset buttons ─────────────────────────────────────────── */}
          <div className="mb-4 grid grid-cols-5 gap-2">
            {DONATE_PRESETS.map((preset) => (
              <button
                key={preset.diamonds}
                onClick={() => { setDiamonds(preset.diamonds); setUseCustom(false); }}
                className={`flex flex-col items-center rounded-xl border-2 py-2 transition-all ${
                  !useCustom && diamonds === preset.diamonds
                    ? `${preset.borderColor} ${preset.bgColor} scale-105`
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <span className={`text-xs font-black ${preset.color}`}>
                  {preset.diamonds >= 1000
                    ? `${preset.diamonds / 1000}K`
                    : preset.diamonds}
                </span>
                <span className="text-[9px] text-white/40">💎</span>
              </button>
            ))}
          </div>

          {/* ── Custom amount ──────────────────────────────────────────── */}
          <div className="mb-4">
            <button
              onClick={() => setUseCustom((v) => !v)}
              className="mb-2 text-xs font-bold text-white/40 hover:text-white/70 transition-colors"
            >
              {useCustom ? '▼ Tự nhập số lượng' : '▶ Tự nhập số lượng'}
            </button>

            <AnimatePresence>
              {useCustom && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="relative">
                    <Diamond className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-yellow-400" />
                    <Input
                      type="number"
                      min={50}
                      max={100000}
                      placeholder="Nhập số kim cương (tối thiểu 50)"
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      className="border-white/10 bg-black/30 pl-9 text-white placeholder:text-white/30 focus-visible:ring-yellow-400/50"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-white/30">
                    Tối thiểu 50 💎 — Tối đa 100,000 💎
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Message ────────────────────────────────────────────────── */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-bold text-white/50">
              Lời nhắn <span className="text-red-400">*</span>
            </label>
            <Textarea
              placeholder="Nhập lời nhắn donate của bạn..."
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 300))}
              rows={3}
              className="resize-none border-white/10 bg-black/30 text-sm text-white placeholder:text-white/30 focus-visible:ring-yellow-400/50"
            />
            <div className="mt-1 flex justify-between">
              <p className="text-[10px] text-white/30">
                Lời nhắn sẽ được đọc to bằng giọng nói
              </p>
              <p className="text-[10px] text-white/30">
                {message.length}/300
              </p>
            </div>
          </div>

           {/* 🧪 Nút test TTS — xóa sau khi debug xong */}
               <button
               onClick={testTTS}
               className="pointer-events-auto absolute right-4 top-4 z-[999] rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-black text-black hover:bg-yellow-300"
             >
               🔊 Test TTS
             </button>

          {/* ── Send button ────────────────────────────────────────────── */}
          <Button
            onClick={handleSend}
            disabled={!canSubmit || mutation.isPending}
            className={`h-12 w-full rounded-xl text-base font-black text-white shadow-lg transition-all disabled:opacity-40 ${activeTier.bgColor} border ${activeTier.borderColor} hover:brightness-125`}
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang gửi...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Donate {activeDiamonds.toLocaleString()} 💎
                {!canAfford && ' — Không đủ kim cương'}
              </span>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
