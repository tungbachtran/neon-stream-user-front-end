// src/types/gift.ts
export interface GiftItem {
    id: string;
    name: string;
    emoji: string;
    iconUrl: string | null;
    animationUrl: string | null;
    diamondCost: number;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    soundKey: string | null;
  }
  
  export interface GiftEvent {
    transactionId: string;
    streamId: string;
    sender: {
      id: string;
      username: string;
      avatar: string | null;
    };
    gift: GiftItem;
    quantity: number;
    totalDiamonds: number;
    comboCount: number;
    timestamp: string;
  }
  
  export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    avatar: string | null;
    totalDiamonds: number;
  }
  