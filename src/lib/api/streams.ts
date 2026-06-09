// src/lib/api/streams.ts
import { apiClient } from "./client";
import { LiveOverview, Stream, StreamCredentials } from "@/types";

export interface CreateStreamData {
  title: string;
  description?: string;
  isChatEnabled?: boolean;
  isPublic?: boolean;
  categoryId?: string;
  thumbnailUrl?: string;
}

export interface UpdateStreamData {
  title?: string;
  description?: string|null;
  isChatEnabled?: boolean;
  isPublic?: boolean;
  categoryId?: string | null;
  thumbnailUrl?: string | null;
}

export const streamsApi = {
  createStream: (data: CreateStreamData) =>
    apiClient.post<Stream>("/streams", data),

  getMyStreams: () => apiClient.get<Stream[]>("/streams/my-streams"),

  getStreamById: (id: string) => apiClient.get<Stream>(`/streams/${id}`),

  getLiveStreams: (limit?: number) =>
    apiClient.get<Stream[]>("/streams/live", {
      params: limit ? { limit } : undefined,
    }),

  getLiveOverview: () => apiClient.get<LiveOverview>("/streams/live-overview"),

  getStreamCredentials: (id: string) =>
    apiClient.get<StreamCredentials>(`/streams/${id}/credentials`),

  startStream: (id: string) => apiClient.post(`/streams/${id}/start`),

  endStream: (id: string) => apiClient.post(`/streams/${id}/end`),

  updateStream: (id: string, data: UpdateStreamData) =>
    apiClient.put<Stream>(`/streams/${id}`, data),

  joinStream: (id: string) => apiClient.post(`/streams/${id}/join`),

  leaveStream: (id: string) => apiClient.post(`/streams/${id}/leave`),
};
