// src/types/index.ts
export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  avatar: string | null;
  role: "VIEWER" | "STREAMER" | "MODERATOR" | "ADMIN";
  bio?: string | null;
  phone?: string | null;
  createdAt: string | number | Date;
}

// thêm vào src/types/index.ts
export type FileType = "AVATAR" | "THUMBNAIL" | "RECORDING" | "ATTACHMENT";

// src/types/index.ts

export interface Stream {
  id: string;
  title: string;
  description: string | null;
  status: "IDLE" | "LIVE" | "ENDED" | "PROCESSING";
  viewerCount: number;
  isChatEnabled: boolean;
  isPublic: boolean;
  thumbnailUrl: string | null;
  recordingUrl: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  playbackUrl: string;

  streamer: {
    id: string;
    username: string;
    fullName: string | null;
    avatar: string | null;
  };

  category?: {
    id: string;
    name: string;
    slug: string;
    thumbnailUrl: string | null;
  } | null;

  metrics: {
    bitrate?: number;
    fps?: number;
    resolution?: string;
    codec?: string;
  } | null;

  createdAt: Date;
}

export interface LiveCategoryStat {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  liveCount: number;
  viewerCount: number;
}

export interface PopularChannel {
  id: string;
  username: string;
  fullName: string | null;
  avatar: string | null;
  viewerCount: number;
  streamId: string;
}

export interface LiveOverview {
  heroStream: Stream | null;
  liveStreams: Stream[];
  topLiveStreams: Stream[];
  liveCategories: LiveCategoryStat[];
  popularChannels: PopularChannel[];
}

export interface StreamCredentials {
  streamKey: string;
  rtmpUrl: string;
  playbackUrl: string;
}
export interface ChatUser {
  id: string;
  username: string;
  avatar: string | null;
  role: string;
}
export interface Message {
  messageId: string;
  userId: string;
  roomId: string;
  content: string;
  status: "VISIBLE" | "HIDDEN" | "FLAGGED" | "DELETED";
  createdAt: string;
  user?: ChatUser;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}
