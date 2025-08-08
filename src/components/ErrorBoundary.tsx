'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { LedgerError, ERROR_CODES } from '@/types/api';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });

    // Log error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, etc.)
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        errorInfo,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  }

  private getErrorMessage(error: Error): { title: string; message: string; actionable: boolean } {
    if (error instanceof LedgerError) {
      switch (error.code) {
        case ERROR_CODES.NETWORK_ERROR:
          return {
            title: 'Connection Problem',
            message: 'Please check your internet connection and try again.',
            actionable: true
          };
        case ERROR_CODES.UNAUTHORIZED:
          return {
            title: 'Authentication Required',
            message: 'Please sign in again to continue.',
            actionable: true
          };
        case ERROR_CODES.PERMISSION_DENIED:
          return {
            title: 'Access Denied',
            message: 'You don\'t have permission to access this resource.',
            actionable: false
          };
        case ERROR_CODES.QUOTA_EXCEEDED:
          return {
            title: 'Service Limit Reached',
            message: 'Please try again later or contact support.',
            actionable: true
          };
        default:
          return {
            title: 'Something went wrong',
            message: error.message || 'An unexpected error occurred.',
            actionable: true
          };
      }
    }

    return {
      title: 'Unexpected Error',
      message: 'We encountered an unexpected problem. Please try refreshing the page.',
      actionable: true
    };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-white border border-gray-200">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                  />
                </svg>
              </div>
            </div>
            {(() => {
              const errorInfo = this.state.error ? this.getErrorMessage(this.state.error) : { title: 'Something went wrong', message: 'An unexpected error occurred.', actionable: true };
              return (
                <>
                  <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
                    {errorInfo.title}
                  </h1>
                  <p className="text-gray-600 text-center mb-6">
                    {errorInfo.message}
                  </p>
                </>
              );
            })()}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  this.props.onReset?.();
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Refresh Page
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 p-4 bg-gray-100 rounded-md overflow-auto max-h-64">
                <h3 className="text-sm font-mono font-bold text-gray-800 mb-2">
                  Error Details (Development Only):
                </h3>
                <pre className="text-xs font-mono text-red-600 whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="mt-2 text-xs font-mono text-gray-700 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}