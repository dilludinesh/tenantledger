'use client';

import { useEffect } from 'react';

export function ErrorFilter() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

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

    function shouldFilter(message: unknown): boolean {
      if (!message) return false;
      const str = String(message).toLowerCase();
      return filterPatterns.some(pattern => str.includes(pattern.toLowerCase()));
    }

    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // Override console methods
    console.error = function(...args) {
      if (shouldFilter(args[0])) return;
      originalError.apply(console, args);
    };

    console.warn = function(...args) {
      if (shouldFilter(args[0])) return;
      originalWarn.apply(console, args);
    };

    // Handle window.onerror
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
      if (shouldFilter(message)) {
        return true; // Suppress error
      }
      
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    // Handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (shouldFilter(event.reason)) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);

    // Cleanup function
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.onerror = originalOnError;
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null; // This component doesn't render anything
}