/**
 * Security event logging utility
 */

export enum SecurityEventType {
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILURE = 'auth_failure',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SUSPICIOUS_INPUT = 'suspicious_input',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification'
}

interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
  details: Record<string, unknown>;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events in memory

  log(type: SecurityEventType, details: Record<string, unknown> = {}, userId?: string): void {
    const event: SecurityEvent = {
      type,
      userId,
      ip: this.getClientIP(),
      userAgent: this.getUserAgent(),
      timestamp: new Date(),
      details
    };

    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY] ${type}:`, event);
    }

    // In production, you would send this to a logging service
    // Example: send to external logging service, database, etc.
  }

  private getClientIP(): string {
    if (typeof window === 'undefined') return 'server';
    // In a real app, you'd get this from request headers
    return 'client';
  }

  private getUserAgent(): string {
    if (typeof window === 'undefined') return 'server';
    return navigator.userAgent;
  }

  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.events.filter(event => event.type === type);
  }

  getEventsByUser(userId: string): SecurityEvent[] {
    return this.events.filter(event => event.userId === userId);
  }
}

export const securityLogger = new SecurityLogger();

// Convenience functions
export const logAuthSuccess = (userId: string) => 
  securityLogger.log(SecurityEventType.AUTH_SUCCESS, {}, userId);

export const logAuthFailure = (reason: string) => 
  securityLogger.log(SecurityEventType.AUTH_FAILURE, { reason });

export const logUnauthorizedAccess = (resource: string, userId?: string) => 
  securityLogger.log(SecurityEventType.UNAUTHORIZED_ACCESS, { resource }, userId);

export const logSuspiciousInput = (input: string, field: string, userId?: string) => 
  securityLogger.log(SecurityEventType.SUSPICIOUS_INPUT, { input: input.substring(0, 100), field }, userId);

export const logDataAccess = (resource: string, userId: string) => 
  securityLogger.log(SecurityEventType.DATA_ACCESS, { resource }, userId);

export const logDataModification = (resource: string, action: string, userId: string) => 
  securityLogger.log(SecurityEventType.DATA_MODIFICATION, { resource, action }, userId);