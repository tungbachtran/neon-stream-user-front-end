// src/app/(auth)/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/types/redux-type';
import { fetchProfile } from '@/lib/features/auth/authSlice';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // ✅ Lưu token từ Google OAuth vào localStorage
      localStorage.setItem('access_token', token);
      // Fetch lại profile với token mới
      dispatch(fetchProfile());
      router.replace('/browse');
    } else {
      router.replace('/login');
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08080d] text-white">
      <p>Đang xác thực...</p>
    </div>
  );
}
