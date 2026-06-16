// src/app/payment/history/page.tsx
'use client';

import { useTransactionHistory } from '@/lib/hooks/usePayment';
import { formatVnd } from '@/lib/utils';
import dayjs from 'dayjs';

const STATUS_CONFIG = {
  SUCCESS: { label: 'Thành công', color: 'text-green-400 bg-green-400/10' },
  PENDING: { label: 'Đang xử lý', color: 'text-yellow-400 bg-yellow-400/10' },
  FAILED: { label: 'Thất bại', color: 'text-red-400 bg-red-400/10' },
  CANCELLED: { label: 'Đã hủy', color: 'text-gray-400 bg-gray-400/10' },
  REVERSED: { label: 'Giao dịch đảo', color: 'text-orange-400 bg-orange-400/10' },
  SUSPICIOUS: { label: 'Nghi ngờ', color: 'text-red-500 bg-red-500/10' },
};

export default function TransactionHistoryPage() {
  const { data: transactions, isLoading } = useTransactionHistory();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <div className="text-gray-400">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Lịch sử giao dịch kim cương</h1>

        {!transactions?.length ? (
          <div className="text-center text-gray-500 py-16">Chưa có giao dịch nào</div>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn) => {
              const statusCfg = STATUS_CONFIG[txn.status] ?? STATUS_CONFIG.FAILED;
              return (
                <div
                  key={txn.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">💎</div>
                    <div>
                      <div className="font-semibold">
                        {txn.diamondAmount} Kim cương
                        {txn.bonusDiamondAmount > 0 && (
                          <span className="text-orange-400 text-sm ml-2">
                            +{txn.bonusDiamondAmount} thưởng
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {txn.paymentMethod} · {txn.vnpBankCode ?? '—'} ·{' '}
                        {dayjs(txn.createdAt).format('DD/MM/YYYY HH:mm')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-cyan-400">{formatVnd(txn.amountVnd)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
