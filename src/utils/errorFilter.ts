/**
 * Filter out browser extension errors that don't affect app functionality
 */

export function isExtensionError(error: unknown): boolean {
  if (!error) return false;
  
  const errorString = error?.toString?.() || (error as Error)?.message || '';
  
  // Common extension error patterns
  const extensionErrorPatterns = [
    'runtime.lastError',
    'message port closed',
    'Extension context invalidated',
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'Could not establish connection',
    'Receiving end does not exist',
    'The message port closed before a response was received'
  ];
  
  return extensionErrorPatterns.some(pattern => 
    errorString.toLowerCase().includes(pattern.toLowerCase())
  );
}

export function filterConsoleErrors() {
  // Only filter in production to avoid hiding real development errors
  if (process.env.NODE_ENV !== 'production') return;
  
  const originalError = console.error;
  console.error = (...args) => {
    // Check if this looks like an extension error
    const firstArg = args[0];
    if (isExtensionError(firstArg)) {
      return; // Suppress extension errors
    }
    
    // Log real errors normally
    originalError.apply(console, args);
  };
  
  // Also handle window.onerror for extension errors
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (isExtensionError(message) || isExtensionError(error)) {
      return true; // Suppress extension errors
    }
    
    // Handle real errors normally
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };
}