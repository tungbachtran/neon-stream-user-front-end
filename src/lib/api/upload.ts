const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface UploadResponse {
  publicUrl: string;
}

async function uploadFile(
  endpoint: string,
  file: File,
  token: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? "Upload failed");
  }

  return res.json();
}

export const uploadApi = {
  uploadAvatar: (file: File, token: string) =>
    uploadFile("/upload/avatar", file, token),

  uploadThumbnail: (file: File, token: string) =>
    uploadFile("/upload/thumbnail", file, token),
};
