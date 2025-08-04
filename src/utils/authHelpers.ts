/**
 * Authentication helper utilities to handle COOP and popup issues
 */

import { Auth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signInWithPopup } from 'firebase/auth';

export interface AuthResult {
  success: boolean;
  error?: string;
  requiresRedirect?: boolean;
}

/**
 * Detect if the current environment has COOP restrictions
 */
export function hasCOOPRestrictions(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if we're in a restrictive environment
  try {
    // Try to access window.opener (this will fail with COOP restrictions)
    if (window.opener !== null) {
      // Opener is accessible
    }
    return false; // If we can check opener, COOP is not blocking
  } catch {
    return true; // If accessing opener throws, COOP is likely blocking
  }
}

/**
 * Detect if we're on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Determine the best authentication method based on environment
 */
export function getBestAuthMethod(): 'popup' | 'redirect' {
  // Always use redirect on mobile
  if (isMobileDevice()) return 'redirect';
  
  // Use redirect if COOP restrictions detected
  if (hasCOOPRestrictions()) return 'redirect';
  
  // Default to popup for desktop
  return 'popup';
}

/**
 * Enhanced Google Sign-In with automatic fallback
 */
export async function signInWithGoogleEnhanced(auth: Auth): Promise<AuthResult> {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  const preferredMethod = getBestAuthMethod();

  if (preferredMethod === 'redirect') {
    try {
      await signInWithRedirect(auth, provider);
      return { success: true, requiresRedirect: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Redirect authentication failed'
      };
    }
  }

  // Try popup first
  try {
    await signInWithPopup(auth, provider);
    return { success: true };
  } catch (popupError: unknown) {
    // Check if it's a popup-related error
    const errorCode = popupError && typeof popupError === 'object' && 'code' in popupError 
      ? (popupError as { code: string }).code 
      : '';

    if (errorCode === 'auth/popup-blocked' || 
        errorCode === 'auth/popup-closed-by-user' ||
        errorCode === 'auth/cancelled-popup-request') {
      
      // Fallback to redirect
      try {
        await signInWithRedirect(auth, provider);
        return { success: true, requiresRedirect: true };
      } catch (redirectError) {
        return {
          success: false,
          error: redirectError instanceof Error ? redirectError.message : 'Authentication failed'
        };
      }
    }

    return {
      success: false,
      error: popupError instanceof Error ? popupError.message : 'Authentication failed'
    };
  }
}

/**
 * Handle redirect result after page load
 */
export async function handleRedirectResult(auth: Auth): Promise<AuthResult> {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return { success: true };
    }
    return { success: false }; // No redirect result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to handle redirect result'
    };
  }
}

/**
 * Get user-friendly error message
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return 'An unexpected error occurred during sign in';
  }

  const errorCode = (error as { code: string }).code;
  
  switch (errorCode) {
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked. Please allow popups for this site or try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in request was cancelled. Please try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Please contact support.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for sign-in. Please contact support.';
    default:
      return (error as { message?: string }).message || 'Sign-in failed. Please try again.';
  }
}