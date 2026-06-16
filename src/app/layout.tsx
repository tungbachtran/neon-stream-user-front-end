// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/lib/providers/query-provider';
import { ReduxProvider } from '@/lib/providers/redux-provider';
import { AuthBootstrap } from '@/lib/providers/auth-bootstrap';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'AetherStream - Professional Live Streaming Platform',
  description: 'Stream, engage, and grow your audience with AetherStream',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased`}
      >
        <ReduxProvider>
          <QueryProvider>
          <Toaster position="top-right" richColors />
            <AuthBootstrap>{children}</AuthBootstrap>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}