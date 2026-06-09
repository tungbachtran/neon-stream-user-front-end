// src/types/check-in.ts
export interface WeeklyDay {
    day: number;
    label: string;
    emoji: string;
    amount: number | null;
    isCompleted: boolean;
    isCurrent: boolean;
    isUpcoming: boolean;
  }
  
  export interface CheckInStatus {
    hasCheckedInToday: boolean;
    currentStreak: number;
    nextReward: {
      day: number;
      type: string;
      amount: number | null;
      label: string;
      emoji: string;
    };
    weeklyProgress: WeeklyDay[];
    lastCheckIn: string | null;
  }
  
  export interface CheckInResult {
    success: boolean;
    streakCount: number;
    reward: {
      type: string;
      amount: number | null;
      label: string;
      emoji: string;
    };
    newBalance: number;
    message: string;
  }
  