/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  streamsApi,
  CreateStreamData,
  UpdateStreamData,
} from "@/lib/api/streams";
import { toast } from "sonner";
import { Stream } from "@/types";

export function useStreams() {
  const queryClient = useQueryClient();

  const { data: liveStreams, isLoading: isLoadingLive } = useQuery<Stream[]>({
    queryKey: ["streams", "live"],
    queryFn: streamsApi.getLiveStreams,
    refetchInterval: 10000,
  });

  const { data: myStreams, isLoading: isLoadingMy } = useQuery({
    queryKey: ["streams", "my"],
    queryFn: streamsApi.getMyStreams,
  });

  const createStreamMutation = useMutation({
    mutationFn: (data: CreateStreamData) => streamsApi.createStream(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams", "my"] });

      toast.success("Stream created!", {
        description: "Your stream is ready to go live",
      });
    },
    onError: (error: any) => {
      toast.error("Create stream failed", {
        description: error?.message || "Something went wrong",
      });
    },
  });

  const startStreamMutation = useMutation({
    mutationFn: (id: string) => streamsApi.startStream(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });

      toast.success("Stream started!", {
        description: "You are now live",
      });
    },
    onError: (error: any) => {
      toast.error("Start stream failed", {
        description: error?.message || "Cannot start stream",
      });
    },
  });

  const endStreamMutation = useMutation({
    mutationFn: (id: string) => streamsApi.endStream(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams"] });

      toast("Stream ended", {
        description: "Your stream has been stopped",
      });
    },
    onError: (error: any) => {
      toast.error("End stream failed", {
        description: error?.message || "Cannot end stream",
      });
    },
  });

  return {
    liveStreams,
    myStreams,
    isLoadingLive,
    isLoadingMy,
    createStream: createStreamMutation.mutate,
    startStream: startStreamMutation.mutate,
    endStream: endStreamMutation.mutate,
  };
}

export function useStream(id: string) {
  const queryClient = useQueryClient();

  const { data: stream, isLoading } = useQuery({
    queryKey: ["streams", id],
    queryFn: () => streamsApi.getStreamById(id),
    enabled: !!id,
  });

  const { data: credentials } = useQuery({
    queryKey: ["streams", id, "credentials"],
    queryFn: () => streamsApi.getStreamCredentials(id),
    enabled: !!id,
  });

  const updateStreamMutation = useMutation({
    mutationFn: (data: UpdateStreamData) => streamsApi.updateStream(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streams", id] });

      toast.success("Stream updated", {
        description: "Changes saved successfully",
      });
    },
    onError: (error: any) => {
      toast.error("Update failed", {
        description: error?.message || "Cannot update stream",
      });
    },
  });

  return {
    stream,
    credentials,
    isLoading,
    updateStream: updateStreamMutation.mutate,
  };
}
