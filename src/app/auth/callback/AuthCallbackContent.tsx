'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/types/redux-type';
import { fetchProfile } from '@/lib/features/auth/authSlice';

export default function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const hasHandled = useRef(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (hasHandled.current) return;

    hasHandled.current = true;

    const handleGoogleCallback = async () => {
      if (!token) {
        router.replace('/login?error=missing_google_token');
        return;
      }

      localStorage.setItem('access_token', token);

      try {
        await dispatch(fetchProfile()).unwrap();

        router.replace('/browse');
      } catch (error) {
        console.error('Google callback error:', error);

        localStorage.removeItem('access_token');

        router.replace('/login?error=google_login_failed');
      }
    };

    void handleGoogleCallback();
  }, [token, dispatch, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08080d] text-white">
      <p>Đang xác thực...</p>
    </div>
  );
}