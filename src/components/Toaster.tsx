/**
 * Global toast notification component
 */

'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        className: '',
        duration: 5000,
        style: {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          color: '#333',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
          fontSize: '14px',
          maxWidth: '350px',
        },
        // Customize different types of toasts
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10B981',
            secondary: '#FFFFFF',
          },
          style: {
            border: '1px solid rgba(16, 185, 129, 0.2)',
            background: 'rgba(236, 253, 245, 0.9)',
          },
        },
        error: {
          duration: 6000,
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FFFFFF',
          },
          style: {
            border: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'rgba(254, 242, 242, 0.9)',
          },
        },
        loading: {
          duration: Infinity,
          style: {
            background: 'rgba(243, 244, 246, 0.9)',
            backdropFilter: 'blur(10px)',
          },
        },
      }}
    />
  );
}
