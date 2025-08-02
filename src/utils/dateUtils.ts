/**
 * Date utility functions for formatting and manipulating dates
 */

import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a date object or string to a readable format
 * @param date Date object or ISO string
 * @param formatString Optional format string (default: 'PPP')
 * @returns Formatted date string or empty string if invalid
 */
export const formatDate = (date: Date | string | null | undefined, formatString = 'PPP'): string => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;

    if (!isValid(dateObj)) {
      return '';
    }

    return format(dateObj, formatString);
  } catch {
    return '';
  }
};

/**
 * Format a date for form input (YYYY-MM-DD)
 * @param date Date object or ISO string
 * @returns Formatted date string for input fields
 */
export const formatDateForInput = (date: Date | string | null | undefined): string => {
  return formatDate(date, 'yyyy-MM-dd');
};

/**
 * Get the current date as a YYYY-MM-DD string
 * @returns Current date as YYYY-MM-DD
 */
export const getCurrentDateForInput = (): string => {
  return formatDateForInput(new Date());
};

interface FirebaseTimestamp {
  toDate: () => Date;
}

/**
 * Convert Firebase timestamp to Date object
 * @param timestamp Firebase timestamp or date object
 * @returns JavaScript Date object
 */
export const firebaseTimestampToDate = (timestamp: FirebaseTimestamp | Date | string | null | undefined): Date => {
  if (!timestamp) return new Date();

  // Handle Firebase Timestamp
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }

  // Handle Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // Handle ISO string
  if (typeof timestamp === 'string') {
    const parsed = parseISO(timestamp);
    return isValid(parsed) ? parsed : new Date();
  }

  // Default to current date
  return new Date();
};

/**
 * Group dates by month and year
 * @param dates Array of dates
 * @returns Object with dates grouped by 'YYYY-MM'
 */
export const groupDatesByMonth = <T extends { date: Date | string }>(items: T[]): Record<string, T[]> => {
  return items.reduce((acc, item) => {
    const date = typeof item.date === 'string' ? parseISO(item.date) : item.date;
    const monthKey = format(date, 'yyyy-MM');

    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }

    acc[monthKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};
