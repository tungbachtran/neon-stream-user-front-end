import { Suspense } from 'react';
import AuthCallbackContent from './AuthCallbackContent';

function AuthCallbackLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08080d] text-white">
      <p>Đang xác thực...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}