// src/hooks/usePayment.ts
'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentApi } from '@/lib/api/payment';
import { toast } from 'sonner';

export function useCreatePayment() {
  return useMutation({
    mutationFn: paymentApi.createVnpayPayment,
    onSuccess: ({ paymentUrl }) => {
      // Redirect sang cổng VNPAY
      window.location.href = paymentUrl;
    },
    onError: () => {
      toast.error('Không thể tạo giao dịch', {
        description: 'Vui lòng thử lại sau',
      });
    },
  });
}

export function useTransactionHistory() {
  return useQuery({
    queryKey: ['payment', 'history'],
    queryFn: paymentApi.getHistory,
    staleTime: 30_000,
  });
}

export function useTransaction(txnRef: string) {
  return useQuery({
    queryKey: ['payment', 'transaction', txnRef],
    queryFn: () => paymentApi.getTransaction(txnRef),
    enabled: !!txnRef,
  });
}
