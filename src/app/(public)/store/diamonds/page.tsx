// src/app/store/diamonds/page.tsx
'use client';

import { useState } from 'react';
import { PACKAGES, DiamondPackage } from '@/lib/api/payment';
import { useCreatePayment } from '@/lib/hooks/usePayment';
import { formatVnd } from '@/lib/utils';
import { cn } from '@/lib/utils';

const PAYMENT_METHODS = [
  { id: 'VNPAY', label: 'VNPay', icon: 'VP', description: 'QR / ATM / Thẻ quốc tế' },
];

export default function DiamondStorePage() {
  const [selectedPackage, setSelectedPackage] = useState<DiamondPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');
  const { mutate: createPayment, isPending } = useCreatePayment();

  const handleProceed = () => {
    if (!selectedPackage) return;
    createPayment({
      packageKey: selectedPackage.key,
      paymentMethod,
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white pl-10 pt-6 ">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 ">
        {/* ── Trái: Gói ── */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              NẠP <span className="text-cyan-400">KIM CƯƠNG</span>
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Hỗ trợ streamer yêu thích của bạn, mở khóa emote độc quyền.
            </p>
          </div>

          {/* Lưới Gói */}
          <div className="grid grid-cols-2 gap-4">
            {PACKAGES.map((pkg) => (
              <button
                key={pkg.key}
                onClick={() => setSelectedPackage(pkg)}
                className={cn(
                  'relative p-5 rounded-xl border text-left transition-all',
                  selectedPackage?.key === pkg.key
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-white/10 bg-white/5 hover:border-white/30',
                )}
              >
                <span className="text-xs text-gray-400 uppercase tracking-widest">
                  {pkg.tier}
                </span>
                <div className="mt-2 text-xl font-bold">{pkg.label}</div>
                <div className="text-cyan-400 text-sm font-semibold mt-1">
                  {formatVnd(pkg.priceVnd)}
                </div>
                {selectedPackage?.key === pkg.key && (
                  <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-cyan-400" />
                )}
              </button>
            ))}
          </div>




          {/* Phương thức thanh toán */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Phương thức thanh toán
            </h2>
            <div className="flex gap-3">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={cn(
                    'flex-1 p-3 rounded-xl border text-center transition-all',
                    paymentMethod === m.id
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-white/10 bg-white/5 hover:border-white/30',
                  )}
                >
                  <div className="text-xs font-bold text-cyan-400">{m.icon}</div>
                  <div className="text-sm font-semibold mt-1">{m.label}</div>
                  <div className="text-xs text-gray-400">{m.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Phải: Tóm tắt Thanh toán ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit sticky top-6">
          <h2 className="font-bold text-lg mb-4">TÓM TẮT THANH TOÁN</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Gói đã chọn</span>
              <span className="font-semibold text-cyan-400">
                {selectedPackage ? `${selectedPackage.diamonds} Kim cương` : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phương thức thanh toán</span>
              <span className="font-semibold text-purple-400">{paymentMethod}</span>
            </div>
            {selectedPackage && (
              <div className="flex justify-between">
                <span className="text-gray-400">Bonus</span>
                <span className="font-semibold text-orange-400">
                  {selectedPackage.priceVnd >= 100_000
                    ? `+${selectedPackage.diamonds} (Lần đầu)`
                    : 'Không áp dụng'}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="text-xs text-gray-400 mb-1">TỔNG CỘNG</div>
            <div className="text-3xl font-bold text-purple-400">
              {selectedPackage ? formatVnd(selectedPackage.priceVnd) : '—'}
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Bằng cách nhấn thanh toán, bạn đồng ý với Điều khoản dịch vụ. Giao dịch không hoàn tiền.
          </p>

          <button
            onClick={handleProceed}
            disabled={!selectedPackage || isPending}
            className={cn(
              'w-full mt-4 py-3 rounded-xl font-bold transition-all',
              selectedPackage && !isPending
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-white/10 text-gray-500 cursor-not-allowed',
            )}
          >
            {isPending ? 'Đang xử lý...' : 'TIẾP TỤC THANH TOÁN'}
          </button>
        </div>
      </div>
    </div>
  );
}
