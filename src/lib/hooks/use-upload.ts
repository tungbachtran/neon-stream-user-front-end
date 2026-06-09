// src/lib/hooks/use-upload.ts
"use client";

import { useState } from "react";
import { uploadApi } from "@/lib/api/upload";
import { FileType } from "@/types";
import { toast } from "sonner";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Upload file lên MinIO qua presigned URL flow:
   * 1. Lấy presigned URL từ backend
   * 2. PUT file thẳng lên MinIO
   * 3. Confirm để backend lưu metadata
   * Trả về publicUrl
   */
  async function uploadFile(
    userId: string,
    file: File,
    fileType: FileType
  ): Promise<string> {
    setIsUploading(true);

    try {
      // Step 1: lấy presigned URL
      const presigned = await uploadApi.requestPresignedUrl({
        userId,
        fileName: file.name,
        fileType,
      });

      // Step 2: upload thẳng lên MinIO
      await uploadApi.uploadToMinio(presigned.uploadUrl, file);

      // Step 3: confirm để backend cập nhật metadata
      const confirmed = await uploadApi.confirmUpload(
        presigned.fileId,
        userId
      );

      return confirmed.publicUrl;
    } finally {
      setIsUploading(false);
    }
  }

  return { uploadFile, isUploading };
}
