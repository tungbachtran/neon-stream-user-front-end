// src/lib/providers/auth-bootstrap.tsx
'use client';

import { useEffect } from 'react';
import { fetchProfile } from '@/lib/features/auth/authSlice';

import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen';
import { useAppDispatch, useAppSelector } from '@/types/redux-type';

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isCheckingAuth } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  if (isCheckingAuth) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}