import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// ✅ Thêm vào
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ✅ Thêm luôn helper này cho tiện
export function formatDiamond(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}