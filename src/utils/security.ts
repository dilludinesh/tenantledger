/**
 * Security utilities for CSRF protection and rate limiting
 */

// Generate CSRF token
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Store CSRF token in session storage
export function setCSRFToken(): string {
  if (typeof window === 'undefined') return '';
  
  const token = generateCSRFToken();
  sessionStorage.setItem('csrf_token', token);
  return token;
}

// Validate CSRF token
export function validateCSRFToken(token: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const storedToken = sessionStorage.getItem('csrf_token');
  return storedToken === token && token.length === 64;
}

// Rate limiting utility
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = {
  get: (key: string): RateLimitEntry | undefined => {
    if (typeof window === 'undefined') return undefined;
    const entry = localStorage.getItem(key);
    return entry ? JSON.parse(entry) : undefined;
  },
  set: (key: string, entry: RateLimitEntry) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(entry));
  },
  delete: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
  entries: (): [string, RateLimitEntry][] => {
    if (typeof window === 'undefined') return [];
    return Object.keys(localStorage).map(key => [key, JSON.parse(localStorage.getItem(key)!)]);
  }
};

export function checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Clean expired rate limit entries
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Security headers validation
export function validateSecurityHeaders(headers: Headers): boolean {
  const requiredHeaders: { [key: string]: string } = {
    'x-frame-options': 'SAMEORIGIN',
    'x-content-type-options': 'nosniff',
    'x-xss-protection': '1; mode=block',
    'content-security-policy': "default-src 'self'"
  };
  
  return Object.entries(requiredHeaders).every(([header, value]) => {
    const headerValue = headers.get(header);
    return headerValue ? headerValue.includes(value) : false;
  });
}

// Input validation for potential attacks
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    // Common SQL keywords
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|TRUNCATE|DECLARE|MERGE)\b)/i,
    // Tautologies
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    // Comments
    /(--|\/\*|\*\/|#)/,
    // Dangerous characters
    /[;'"`]/,
    // Common attack patterns
    /(\b(xp_cmdshell|sp_executesql|sp_configure)\b)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

// XSS detection
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    // Script tags
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    // Javascript URLs
    /javascript:/gi,
    // Event handlers
    /on\w+\s*=/gi,
    // Other dangerous tags
    /<(iframe|object|embed|form|video|audio|svg|math|style|link|meta)\b[^<]*/gi,
    // Dangerous attributes
    /\s(src|href|formaction|style|background|poster|data|codebase|classid|profile|usemap)\s*=/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}