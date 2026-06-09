// src/lib/api/donate.ts
import { apiClient } from './client';

export type DonateTier = 'BLUE' | 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export interface SendDonatePayload {
  streamId:        string;
  diamonds:        number;
  message:         string;
  idempotencyKey?: string;
}

export interface SendDonateResponse {
  success:          boolean;
  txnId:            string;
  duplicate:        boolean;
  diamonds?:        number;
  tier?:            DonateTier;
  remainingBalance?: number;
}

export interface DonateLeaderboardItem {
  userId:        string;
  username:      string;
  totalDiamonds: number;
}

// Preset tiers để user chọn nhanh
export const DONATE_PRESETS: {
  diamonds: number;
  tier: DonateTier;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    diamonds:    50,
    tier:        'BLUE',
    label:       '50 💎',
    color:       'text-blue-300',
    bgColor:     'bg-blue-500/20',
    borderColor: 'border-blue-400/40',
  },
  {
    diamonds:    200,
    tier:        'GREEN',
    label:       '200 💎',
    color:       'text-green-300',
    bgColor:     'bg-green-500/20',
    borderColor: 'border-green-400/40',
  },
  {
    diamonds:    500,
    tier:        'YELLOW',
    label:       '500 💎',
    color:       'text-yellow-300',
    bgColor:     'bg-yellow-500/20',
    borderColor: 'border-yellow-400/40',
  },
  {
    diamonds:    1000,
    tier:        'ORANGE',
    label:       '1000 💎',
    color:       'text-orange-300',
    bgColor:     'bg-orange-500/20',
    borderColor: 'border-orange-400/40',
  },
  {
    diamonds:    2000,
    tier:        'RED',
    label:       '2000 💎',
    color:       'text-red-300',
    bgColor:     'bg-red-500/20',
    borderColor: 'border-red-400/40',
  },
];

// src/lib/api/donate.ts
export const donateApi = {
  sendDonate: (payload: SendDonatePayload): Promise<SendDonateResponse> =>
    apiClient.post<SendDonateResponse>('/donate/send', payload),

  getLeaderboard: (streamId: string): Promise<DonateLeaderboardItem[]> =>
    apiClient.get<DonateLeaderboardItem[]>(`/donate/leaderboard/${streamId}`),
};


