/**
 * Centralized error handling service
 */

import { toast } from 'react-hot-toast';

// Firebase authentication error codes
export enum FirebaseAuthError {
  POPUP_CLOSED = 'auth/popup-closed-by-user',
  POPUP_BLOCKED = 'auth/popup-blocked',
  CANCELLED_POPUP = 'auth/cancelled-popup-request',
  UNAUTHORIZED_DOMAIN = 'auth/unauthorized-domain',
  OPERATION_NOT_ALLOWED = 'auth/operation-not-allowed',
  INVALID_EMAIL = 'auth/invalid-email',
}

// Application error types
export enum AppErrorType {
  AUTH = 'authentication',
  DATABASE = 'database',
  NETWORK = 'network',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

/**
 * Format Firebase auth errors into user-friendly messages
 */
export const formatAuthError = (error: unknown): string => {
  if (!error) return 'An unknown error occurred';

  // Handle Firebase auth errors
  if (typeof error === 'object' && 'code' in error) {
    const err = error as { code: string; message?: string };

    switch (err.code) {
      case FirebaseAuthError.POPUP_CLOSED:
      case FirebaseAuthError.CANCELLED_POPUP:
        return 'Sign in was cancelled';

      case FirebaseAuthError.POPUP_BLOCKED:
        return 'Sign in popup was blocked. Please allow popups for this site.';

      case FirebaseAuthError.UNAUTHORIZED_DOMAIN:
        return 'This domain is not authorized for authentication. Please contact support.';

      case FirebaseAuthError.OPERATION_NOT_ALLOWED:
        return 'This authentication method is not enabled. Please contact support.';

      case FirebaseAuthError.INVALID_EMAIL:
        return 'Invalid email address. Please check and try again.';

      default:
        return err.message || 'An error occurred during authentication';
    }
  }

  // Handle string or Error object
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred';
};

/**
 * Handle application errors with appropriate logging and user notification
 */
export const handleAppError = (
  error: unknown, 
  type: AppErrorType = AppErrorType.UNKNOWN,
  shouldNotify = true
): string => {
  let errorMessage = 'An unexpected error occurred';

  // Format error based on type
  switch (type) {
    case AppErrorType.AUTH:
      errorMessage = formatAuthError(error);
      break;

    case AppErrorType.DATABASE:
      errorMessage = 'Database operation failed. Please try again.';
      break;

    case AppErrorType.NETWORK:
      errorMessage = 'Network connection issue. Please check your internet connection.';
      break;

    case AppErrorType.VALIDATION:
      errorMessage = error instanceof Error ? error.message : 'Validation failed. Please check your input.';
      break;

    default:
      // Handle unexpected errors silently
      errorMessage = 'An unexpected error occurred. Please try again.';
  }

  // Notify user if requested
  if (shouldNotify) {
    toast.error(errorMessage, {
      duration: 6000,
      position: 'top-center',
    });
  }

  return errorMessage;
};
