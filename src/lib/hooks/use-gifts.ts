// src/lib/hooks/use-gifts.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { giftsApi, SendGiftPayload } from "@/lib/api/gifts";
import { GiftEvent, LeaderboardEntry } from "@/types/gift";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export function useGiftCatalog() {
  return useQuery({
    queryKey: ["gifts", "catalog"],
    queryFn: giftsApi.getCatalog,
    staleTime: 5 * 60 * 1000, // 5 phút
  });
}

export function useGiftBalance() {
  return useQuery({
    queryKey: ["gifts", "balance"],
    queryFn: giftsApi.getBalance,
    refetchInterval: 30000,
  });
}

export function useLeaderboard(streamId: string) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const { data: initialData } = useQuery({
    queryKey: ["gifts", "leaderboard", streamId],
    queryFn: () => giftsApi.getLeaderboard(streamId),
    enabled: !!streamId,
  });

  useEffect(() => {
    if (initialData) setLeaderboard(initialData);
  }, [initialData]);

  const updateFromSocket = useCallback((data: LeaderboardEntry[]) => {
    setLeaderboard(data);
  }, []);

  return { leaderboard, updateFromSocket };
}

export function useSendGift(streamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<SendGiftPayload, "idempotencyKey">) =>
      giftsApi.sendGift({
        ...payload,
        idempotencyKey: uuidv4(),
      }),
    onSuccess: (data) => {
      // Update balance optimistically
      queryClient.setQueryData(["gifts", "balance"], {
        balance: data.newBalance,
      });
    },
    onError: (error: any) => {
      const msg = error?.message || "Failed to send gift";
      if (msg.includes("INSUFFICIENT")) {
        toast.error("Not enough diamonds! 💎", {
          description: "Top up your diamonds to send gifts",
        });
      } else {
        toast.error("Gift failed", { description: msg });
      }
    },
  });
}

// Hook quản lý gift animations từ WebSocket
// ✅ Fix đơn giản nhất: tách leaderboard update ra khỏi useGiftEvents
// và dùng queryClient để sync

export function useGiftEvents(streamId: string) {
  const [activeGifts, setActiveGifts] = useState<
    (GiftEvent & { uid: string })[]
  >([]);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient(); // ✅ Dùng react-query để sync

  useEffect(() => {
    if (!streamId) return;

    const socket = io(`${process.env.NEXT_PUBLIC_WS_URL}/gifts`, {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join_stream_gifts", { streamId });
    });

    socket.on("gift_received", (event: GiftEvent) => {
      const uid = `${event.transactionId}-${Date.now()}`;
      setActiveGifts((prev) => [...prev, { ...event, uid }]);
      setTimeout(() => {
        setActiveGifts((prev) => prev.filter((g) => g.uid !== uid));
      }, 4000);
    });

    socket.on("leaderboard_updated", (data: LeaderboardEntry[]) => {
      // ✅ Update query cache → tất cả component dùng useLeaderboard đều update
      queryClient.setQueryData(["gifts", "leaderboard", streamId], data);
    });

    socketRef.current = socket;
    return () => {
      socket.emit("leave_stream_gifts", { streamId });
      socket.disconnect();
    };
  }, [streamId, queryClient]); // ✅ deps đầy đủ

  return { activeGifts };
}
