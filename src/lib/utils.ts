/**
 * A utility function that combines multiple class names into a single string.
 * Filters out any falsy values and joins them with spaces.
 * 
 * @example
 * cn('class1', false && 'class2', 'class3') // 'class1 class3'
 */
export function cn(...classes: Array<string | boolean | undefined | null>) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a date string into a human-readable format.
 * 
 * @param date - The date string or Date object to format
 * @returns Formatted date string (e.g., "Jan 1, 2023")
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a number as a currency string.
 * 
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Truncates a string to a specified length and adds an ellipsis if truncated.
 * 
 * @param str - The string to truncate
 * @param length - The maximum length of the string
 * @returns The truncated string with ellipsis if necessary
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Generates a unique ID.
 * 
 * @returns A unique string ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Debounces a function call.
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Converts a string to title case.
 * 
 * @param str - The string to convert
 * @returns The string in title case
 */
export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

/**
 * Checks if the current environment is a browser.
 * 
 * @returns True if running in a browser environment, false otherwise
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Safely parses a JSON string.
 * 
 * @param str - The JSON string to parse
 * @param defaultValue - The default value to return if parsing fails
 * @returns The parsed object or the default value
 */
export function safeJsonParse<T>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Creates a function that only runs after the leading edge.
 * 
 * @param func - The function to call
 * @param wait - The number of milliseconds to wait before allowing another call
 * @returns A throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  
  return function executedFunction(...args: Parameters<T>) {
    const now = Date.now();
    
    if (now - lastTime >= wait) {
      func(...args);
      lastTime = now;
    }
  };
}
