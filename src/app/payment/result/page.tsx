// src/app/payment/result/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentApi } from '@/lib/api/payment';
import { formatVnd } from '@/lib/utils';

export default function PaymentResultPage() {
  const params = useSearchParams();
  const router = useRouter();

  const success = params.get('success') === 'true';
  const txnRef = params.get('txnRef') ?? '';
  const code = params.get('code') ?? '';
  const message = params.get('message') ?? '';

  // Poll transaction để lấy thông tin đầy đủ từ DB
  const { data: txn } = useQuery({
    queryKey: ['payment', 'transaction', txnRef],
    queryFn: () => paymentApi.getTransaction(txnRef),
    enabled: !!txnRef,
    refetchInterval: (data) =>
      data?.status === 'PENDING' ? 3000 : false, // poll nếu còn PENDING
  });

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        {/* Icon */}
        <div className={`text-6xl mb-4 ${success ? 'text-green-400' : 'text-red-400'}`}>
          {success ? '✓' : '✗'}
        </div>

        <h1 className="text-2xl font-bold mb-2">
          {success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </h1>
        <p className="text-gray-400 text-sm mb-6">{message}</p>

        {/* Transaction Details */}
        {txn && (
          <div className="bg-white/5 rounded-xl p-4 text-left space-y-2 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-gray-400">Mã giao dịch</span>
              <span className="font-mono text-xs">{txnRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gói</span>
              <span>{txn.diamondAmount} Diamonds</span>
            </div>
            {txn.bonusDiamondAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Thưởng</span>
                <span className="text-orange-400">+{txn.bonusDiamondAmount} Diamonds</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Số tiền</span>
              <span className="text-cyan-400 font-semibold">{formatVnd(txn.amountVnd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phương thức</span>
              <span>{txn.vnpCardType ?? txn.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Trạng thái</span>
              <span className={txn.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400'}>
                {txn.status}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/store/diamonds')}
            className="flex-1 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-all text-sm"
          >
            Nạp thêm
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition-all text-sm font-semibold"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
