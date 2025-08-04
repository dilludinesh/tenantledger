// API response types and error handling

export interface PaginationParams {
  limit?: number;
  cursor?: string; // Document ID for cursor-based pagination
  orderBy?: 'date' | 'createdAt' | 'amount';
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
  total?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class LedgerError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'LedgerError';
    this.code = code;
    this.details = details;
  }
}

// Error codes
export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  
  // Database errors
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Helper function to create typed errors
export function createLedgerError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): LedgerError {
  return new LedgerError(code, message, details);
}

// Helper to handle Firebase errors
export function handleFirebaseError(error: unknown): LedgerError {
  if (error && typeof error === 'object' && 'code' in error) {
    const firebaseError = error as { code: string; message?: string };
    switch (firebaseError.code) {
      case 'permission-denied':
        return createLedgerError(ERROR_CODES.PERMISSION_DENIED, 'Access denied');
      case 'not-found':
        return createLedgerError(ERROR_CODES.NOT_FOUND, 'Resource not found');
      case 'quota-exceeded':
        return createLedgerError(ERROR_CODES.QUOTA_EXCEEDED, 'Database quota exceeded');
      case 'unavailable':
        return createLedgerError(ERROR_CODES.NETWORK_ERROR, 'Service temporarily unavailable');
      default:
        return createLedgerError(ERROR_CODES.SERVER_ERROR, firebaseError.message || 'Database error');
    }
  }
  
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  return createLedgerError(ERROR_CODES.UNKNOWN_ERROR, errorMessage);
}