// src/lib/providers/auth-bootstrap.tsx
'use client';

import { useEffect, useRef } from 'react';
import { fetchProfile } from '@/lib/features/auth/authSlice';
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen';
import { useAppDispatch, useAppSelector } from '@/types/redux-type';

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isCheckingAuth } = useAppSelector((state) => state.auth);

  // ✅ useRef đảm bảo chỉ dispatch đúng 1 lần, dù component re-render bao nhiêu lần
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return; // ✅ Đã fetch rồi → bỏ qua
    hasFetched.current = true;
    dispatch(fetchProfile());
  }, [dispatch]);

  // ✅ Chỉ show loading screen lần đầu tiên (isCheckingAuth = true ban đầu)
  // Sau khi fetchProfile xong (fulfilled hoặc rejected), isCheckingAuth = false
  // và sẽ không bao giờ về true nữa → không bao giờ show loading lại
  if (isCheckingAuth) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
