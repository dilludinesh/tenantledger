'use client';

import { useEffect, useState } from 'react';

export default function ClientBody({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark as client-side after hydration
    setIsClient(true);
    
    // Clean up browser extension attributes that cause hydration issues
    const cleanup = () => {
      const body = document.body;
      // Remove Grammarly attributes
      body.removeAttribute('data-new-gr-c-s-check-loaded');
      body.removeAttribute('data-gr-ext-installed');
      // Remove other common extension attributes
      body.removeAttribute('data-new-gr-c-s-loaded');
      body.removeAttribute('cz-shortcut-listen');
    };

    // Run cleanup after hydration
    const timer = setTimeout(cleanup, 50);
    return () => clearTimeout(timer);
  }, []);

  // Prevent hydration mismatch by only rendering children after client-side hydration
  if (!isClient) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return <>{children}</>;
}
