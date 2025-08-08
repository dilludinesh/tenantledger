import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function base64url(bytes: Uint8Array): string {
  // Convert random bytes to base64url string suitable for CSP nonce
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return Buffer.from(bin, 'binary').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildCSP(nonce: string): string {
  // Baseline CSP allowing Next.js, Firebase Auth, and images with per-request nonce
  // Next.js dev/runtime may require 'unsafe-eval' in development for React Refresh and certain parsing paths.
  const self = "'self'";
  const data = "data:";
  const https = "https:";
  const firebase = "*.firebaseapp.com *.firebaseio.com *.googleapis.com";
  const gstatic = "*.gstatic.com";
  const google = "*.google.com *.accounts.google.com";
  const nonceDirective = `'nonce-${nonce}'`;
  const unsafeEval = "'unsafe-eval'";

  const scriptSrc = [
    `script-src ${self}`,
    https,
    google,
    gstatic,
    nonceDirective,
    `'strict-dynamic'`,
    `'unsafe-eval'`,
    'blob:'
  ].filter(Boolean).join(' ');

  const styleSrc = [
    `style-src ${self}`,
    nonceDirective,
    'blob:',
    `'unsafe-inline'` // Required for some Next.js styles
  ].filter(Boolean).join(' ');

  return [
    `default-src ${self}`,
    `base-uri ${self}`,
    `font-src ${self} ${data} ${gstatic}`,
    `img-src ${self} ${data} blob: ${https}`,
    `object-src 'none'`,
    scriptSrc,
    styleSrc,
    `connect-src ${self} ${https} ${firebase} ${gstatic} ${google}`,
    `frame-src ${self} ${google}`,
    `frame-ancestors ${self}`,
    `form-action ${self}`,
  ].join('; ');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Generate a per-request nonce
  const nonce = base64url(crypto.getRandomValues(new Uint8Array(16)));

  // Forward nonce to downstream via header so it can be used by the app if needed
  const response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });
  response.headers.set('x-csp-nonce', nonce);

  // Security headers (applied to all)
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Content-Security-Policy', buildCSP(nonce));

  // HSTS only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  // Scope COOP relaxation to auth-related pages where Firebase popup/redirect is used
  const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/auth');
  response.headers.set('Cross-Origin-Opener-Policy', isAuthPath ? 'unsafe-none' : 'same-origin');

  // Protect sensitive routes
  if (pathname.startsWith('/dashboard')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};