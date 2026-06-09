// src/lib/api/payment.ts
import { apiClient } from './client';

export interface DiamondPackage {
  key: string;
  label: string;
  tier: string;
  diamonds: number;
  priceVnd: number;
}

export interface CreatePaymentResponse {
  paymentUrl: string;
  txnRef: string;
}

export interface DiamondTransaction {
  id: string;
  txnRef: string;
  diamondPackage: string;
  diamondAmount: number;
  bonusDiamondAmount: number;
  amountVnd: number;
  paymentMethod: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REVERSED' | 'SUSPICIOUS';
  vnpBankCode: string | null;
  vnpCardType: string | null;
  vnpPayDate: string | null;
  createdAt: string;
}

export const PACKAGES: DiamondPackage[] = [
  { key: 'starter_100', label: '100 Diamonds', tier: 'Starter', diamonds: 100, priceVnd: 20_000 },
  { key: 'casual_250', label: '250 Diamonds', tier: 'Casual', diamonds: 250, priceVnd: 50_000 },
  { key: 'premium_550', label: '550 Diamonds', tier: 'Premium', diamonds: 550, priceVnd: 100_000 },
  { key: 'whale_2800', label: '2,800 Diamonds', tier: 'Whale', diamonds: 2800, priceVnd: 500_000 },
  { key: 'mega_6000', label: '6,000 Diamonds', tier: 'Mega', diamonds: 6000, priceVnd: 1_000_000 },
];

export const paymentApi = {
  createVnpayPayment: (data: {
    packageKey: string;
    paymentMethod: string;
    bankCode?: string;
  }) => apiClient.post<CreatePaymentResponse>('/payment/vnpay/create', data),

  getHistory: () =>
    apiClient.get<DiamondTransaction[]>('/payment/history'),

  getTransaction: (txnRef: string) =>
    apiClient.get<DiamondTransaction>(`/payment/transaction?txnRef=${txnRef}`),
};
