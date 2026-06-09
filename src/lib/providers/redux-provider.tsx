// src/lib/providers/redux-provider.tsx
'use client';

import { Provider } from 'react-redux';
import { store } from '../store/store'; 
import { apiClient } from '@/lib/api/client';
import { clearAuth } from '@/lib/features/auth/authSlice';

apiClient.setUnauthorizedHandler(() => {
  store.dispatch(clearAuth());

  apiClient.setUnauthorizedHandler(() => {
    store.dispatch(clearAuth());
  });
});

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}