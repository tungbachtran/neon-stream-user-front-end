// src/lib/hooks/use-check-in.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { checkInApi } from "@/lib/api/check-in";
import { toast } from "sonner";

export function useCheckInStatus() {
  return useQuery({
    queryKey: ["check-in", "status"],
    queryFn: checkInApi.getStatus,
    staleTime: 60 * 1000, // 1 phút
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkInApi.checkIn,
    onSuccess: (data) => {
      // Invalidate status để refresh UI
      queryClient.invalidateQueries({ queryKey: ["check-in", "status"] });
      // Update diamond balance
      queryClient.invalidateQueries({ queryKey: ["gifts", "balance"] });

      toast.success(data.message, {
        description: `💎 New balance: ${data.newBalance.toLocaleString()} diamonds`,
        duration: 4000,
      });
    },
    onError: (error: any) => {
      const msg = error?.message || "Check-in failed";
      if (msg.includes("Already checked in")) {
        toast.info("Already checked in today!", {
          description: "Come back tomorrow to continue your streak 🔥",
        });
      } else {
        toast.error("Check-in failed", { description: msg });
      }
    },
  });
}
