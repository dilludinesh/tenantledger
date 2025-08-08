"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { ErrorFilter } from '@/components/ErrorFilter';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      },
    },
  }));
  
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorFilter />
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
