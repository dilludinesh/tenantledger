'use client';

import { useEffect } from 'react';

export default function ClientBody({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // This runs only on the client side after hydration
    const cleanup = () => {
      const body = document.body;
      body.removeAttribute('data-new-gr-c-s-check-loaded');
      body.removeAttribute('data-gr-ext-installed');
    };

    // Run cleanup after a small delay to ensure it happens after hydration
    const timer = setTimeout(cleanup, 100);
    return () => clearTimeout(timer);
  }, []);

  return <>{children}</>;
}
