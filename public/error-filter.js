// Immediate error filtering - runs before any other scripts
(function() {
  'use strict';
  
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  
  // List of patterns to filter out
  const filterPatterns = [
    'runtime.lastError',
    'message port closed',
    'Cross-Origin-Opener-Policy',
    'window.closed call',
    'window.close call',
    'chrome-extension://',
    'moz-extension://',
    'Extension context invalidated',
    'Could not establish connection',
    'Receiving end does not exist'
  ];
  
  function shouldFilter(message) {
    if (!message) return false;
    const str = String(message).toLowerCase();
    return filterPatterns.some(pattern => str.includes(pattern.toLowerCase()));
  }
  
  // Override console.error
  console.error = function(...args) {
    if (shouldFilter(args[0])) {
      return; // Suppress filtered errors
    }
    originalError.apply(console, args);
  };
  
  // Override console.warn
  console.warn = function(...args) {
    if (shouldFilter(args[0])) {
      return; // Suppress filtered warnings
    }
    originalWarn.apply(console, args);
  };
  
  // Override console.log (in case errors are logged here)
  console.log = function(...args) {
    if (shouldFilter(args[0])) {
      return; // Suppress filtered logs
    }
    originalLog.apply(console, args);
  };
  
  // Handle window.onerror
  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (shouldFilter(message)) {
      return true; // Suppress error
    }
    
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }
    return false;
  };
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (shouldFilter(event.reason)) {
      event.preventDefault();
      return;
    }
  });
  
  // Also try to catch errors from the specific file mentioned in your error
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'error' && typeof listener === 'function') {
      const wrappedListener = function(event) {
        if (shouldFilter(event.message || event.error)) {
          return;
        }
        return listener.call(this, event);
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
  
})();