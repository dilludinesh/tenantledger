/**
 * Utility functions for environment-specific behavior
 */

/**
 * Check if the app is running in a production environment
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Check if the app is running in a development environment
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if the app is running in a browser environment
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Get the current hostname (in browser) or empty string (in server)
 */
export const getHostname = (): string => {
  return isBrowser() ? window.location.hostname : '';
};

/**
 * Check if the app is running on localhost
 */
export const isLocalhost = (): boolean => {
  const hostname = getHostname();
  return hostname === 'localhost' || hostname === '127.0.0.1';
};