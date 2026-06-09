/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginData, RegisterData } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(false);

  
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getProfile,
    retry: false,
    staleTime: Infinity,
    enabled: hasToken,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);

      toast.success('Welcome back!', {
        description: `Logged in as ${data.user.username}`,
      });

      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error('Login failed', {
        description: error?.message || 'Invalid credentials',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data.user);

      toast.success('Account created!', {
        description: 'Welcome to the platform',
      });

      router.push('/stream/setup');
    },
    onError: (error: any) => {
      toast.error('Registration failed', {
        description: error?.message || 'Please try again',
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();

      toast('Logged out', {
        description: 'See you next time!',
      });

      router.push('/login');
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}