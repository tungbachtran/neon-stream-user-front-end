// src/lib/api/upload.ts
import { apiClient } from "./client";
import { FileType } from "@/types";

export interface PresignedUploadResponse {
  fileId: string;
  uploadUrl: string;
  objectKey: string;
  expiresAt: string;
}

export interface ConfirmUploadResponse {
  fileId: string;
  objectKey: string;
  bucketName: string;
  publicUrl: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export const uploadApi = {
  requestPresignedUrl: (data: {
    userId: string;
    fileName: string;
    fileType: FileType;
  }) => apiClient.post<PresignedUploadResponse>("/upload/presigned", data),

  uploadToMinio: async (uploadUrl: string, file: File): Promise<void> => {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
  },

  confirmUpload: (fileId: string, userId: string) =>
    apiClient.post<ConfirmUploadResponse>(`/upload/confirm/${fileId}`, {
      userId,
    }),
};
