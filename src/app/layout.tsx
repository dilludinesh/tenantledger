import type { Metadata } from 'next';
import './globals.css';
import Providers from './Providers';
import ClientBody from './ClientBody';
import { ErrorBoundary } from '@/components/ErrorBoundary';


export const metadata: Metadata = {
  title: 'Tenant Ledger',
  description: 'Manage your tenant payments and records',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
};

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="16x16 32x32" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                const originalError = console.error;
                const originalWarn = console.warn;
                const filterPatterns = [
                  'runtime.lastError',
                  'message port closed',
                  'Cross-Origin-Opener-Policy',
                  'window.closed call',
                  'window.close call',
                  'chrome-extension://',
                  'moz-extension://',
                  'Extension context invalidated',
                  'Could not establish connection',
                  'Receiving end does not exist'
                ];
                function shouldFilter(message) {
                  if (!message) return false;
                  const str = String(message).toLowerCase();
                  return filterPatterns.some(pattern => str.includes(pattern.toLowerCase()));
                }
                console.error = function(...args) {
                  if (shouldFilter(args[0])) return;
                  originalError.apply(console, args);
                };
                console.warn = function(...args) {
                  if (shouldFilter(args[0])) return;
                  originalWarn.apply(console, args);
                };
              })();
            `
          }}
        />
      </head>
      <body className="min-h-screen">
        <ErrorBoundary>
          <Providers>
            <ClientBody>
              {children}
            </ClientBody>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RootLayoutContent>{children}</RootLayoutContent>;
}