import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function base64url(bytes: Uint8Array): string {
  // Convert random bytes to base64url string suitable for CSP nonce
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return Buffer.from(bin, 'binary').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildCSP(): string {
  // Simplified CSP for Next.js
  const data = "data:";
  const https = "https:";
  const firebase = "*.firebaseapp.com *.firebaseio.com *.googleapis.com";
  const gstatic = "*.gstatic.com";
  const google = "*.google.com *.accounts.google.com";
  const vercel = "*.vercel.app vercel.app";
  const firebaseAuth = "tenantledgerio.firebaseapp.com";
  
  // Script sources
  const scriptSrc = [
    `script-src`,
    `'self'`,
    `'unsafe-inline'`,
    `'unsafe-eval'`,
    'blob:',
    vercel,
    google,
    gstatic
  ].filter(Boolean).join(' ');

  // Style sources
  const styleSrc = [
    `style-src`,
    `'self'`,
    `'unsafe-inline'`,
    'blob:',
    vercel,
    google,
    gstatic
  ].filter(Boolean).join(' ');
  
  // Image sources
  const imgSrc = [
    `img-src`,
    `'self'`,
    'data:',
    'blob:',
    vercel,
    google,
    gstatic,
    '*.googleapis.com',
    '*.firebaseio.com',
    'firebasestorage.googleapis.com'
  ].filter(Boolean).join(' ');

  // Build the final CSP
  return [
    scriptSrc,
    styleSrc,
    imgSrc,
    `default-src 'self'`,
    `base-uri 'self'`,
    `font-src 'self' ${data} ${gstatic}`,
    `object-src 'none'`,
    `connect-src 'self' ${https} ${vercel} ${firebase} ${gstatic} ${google}`,
    `frame-src 'self' ${google} ${firebaseAuth} ${firebase}`,
    `frame-ancestors 'self'`,
    `form-action 'self'`,
    `worker-src 'self' blob:`,
    `media-src 'self' blob: data:`,
    `upgrade-insecure-requests`
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
  response.headers.set('Content-Security-Policy', buildCSP());

  // HSTS only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  // Simplified COOP/COEP policies to work with Firebase Auth
  // Using less restrictive settings for better compatibility
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  response.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Additional headers for compatibility
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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