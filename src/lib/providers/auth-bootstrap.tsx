// src/lib/providers/auth-bootstrap.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { fetchProfile } from '@/lib/features/auth/authSlice';
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen';
import { useAppDispatch, useAppSelector } from '@/types/redux-type';

export function AuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  const { user,isCheckingAuth } = useAppSelector(
    (state) => state.auth
  );

  const hasFetched = useRef(false);

  const isGoogleCallback = pathname === '/auth/callback';

  useEffect(() => {
    // Trang callback phải tự xử lý token trước
    if (isGoogleCallback) return;

    if (hasFetched.current) return;
    hasFetched.current = true;

    void dispatch(fetchProfile());
  }, [dispatch, isGoogleCallback]);

  // Không dùng global loading để che trang callback
  if (isGoogleCallback) {
    return <>{children}</>;
  }

  if (!user && isCheckingAuth) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}