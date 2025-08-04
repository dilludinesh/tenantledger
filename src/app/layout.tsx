import type { Metadata } from 'next';
import './globals.css';
import Providers from './Providers';
import ClientBody from './ClientBody';
import { ErrorBoundary } from '@/components/ErrorBoundary';


export const metadata: Metadata = {
  title: 'Tenant Ledger',
  description: 'Manage your tenant payments and records',
};

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Tenant Ledger</title>
        <meta name="description" content="Manage tenant finances" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Immediate error filtering - must run synchronously
              (function() {
                const originalError = console.error;
                const originalWarn = console.warn;
                
                const filterPatterns = [
                  'runtime.lastError',
                  'message port closed',
                  'Cross-Origin-Opener-Policy',
                  'window.closed call',
                  'window.close call',
                  'chrome-extension://',
                  'Extension context invalidated'
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
            `,
          }}
        />
      </head>
      <body className="min-h-screen" suppressHydrationWarning={true}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Comprehensive error filtering for extensions and COOP issues
              (function() {
                if (typeof window === 'undefined') return;
                
                // Filter console.error
                const originalError = console.error;
                console.error = function(...args) {
                  const message = args[0]?.toString?.() || '';
                  
                  // Extension errors
                  if (message.includes('runtime.lastError') || 
                      message.includes('message port closed') ||
                      message.includes('Extension context invalidated') ||
                      message.includes('chrome-extension://') ||
                      message.includes('moz-extension://')) {
                    return;
                  }
                  
                  // COOP/Firebase Auth errors (these are warnings, not breaking errors)
                  if (message.includes('Cross-Origin-Opener-Policy') ||
                      message.includes('window.closed call') ||
                      message.includes('window.close call')) {
                    return;
                  }
                  
                  originalError.apply(console, args);
                };
                
                // Filter console.warn for COOP warnings
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  const message = args[0]?.toString?.() || '';
                  
                  if (message.includes('Cross-Origin-Opener-Policy') ||
                      message.includes('window.closed call') ||
                      message.includes('window.close call')) {
                    return;
                  }
                  
                  originalWarn.apply(console, args);
                };
                
                // Handle window errors
                const originalOnError = window.onerror;
                window.onerror = function(message, source, lineno, colno, error) {
                  const msg = message?.toString?.() || '';
                  
                  if (msg.includes('runtime.lastError') ||
                      msg.includes('message port closed') ||
                      msg.includes('Cross-Origin-Opener-Policy')) {
                    return true; // Suppress error
                  }
                  
                  if (originalOnError) {
                    return originalOnError(message, source, lineno, colno, error);
                  }
                  return false;
                };
                
                // Handle unhandled promise rejections
                window.addEventListener('unhandledrejection', function(event) {
                  const message = event.reason?.toString?.() || '';
                  
                  if (message.includes('runtime.lastError') ||
                      message.includes('message port closed') ||
                      message.includes('Cross-Origin-Opener-Policy')) {
                    event.preventDefault();
                  }
                });
              })();
            `,
          }}
        />
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
