"use client";

import { useState } from "react";
import { uploadApi } from "@/lib/api/upload";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);

  function getToken(): string {
    return localStorage.getItem("access_token") ?? "";
  }

  async function uploadImage(
    file: File,
    type: "avatar" | "thumbnail"
  ): Promise<string> {
    setIsUploading(true);
    try {
      const result =
        type === "avatar"
          ? await uploadApi.uploadAvatar(file, getToken())
          : await uploadApi.uploadThumbnail(file, getToken());

      return result.publicUrl;
    } finally {
      setIsUploading(false);
    }
  }

  return { uploadImage, isUploading };
}
