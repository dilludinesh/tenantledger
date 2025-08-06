import { CATEGORIES } from '@/types/ledger';
import { detectSQLInjection, detectXSS } from './security';
import { 
  validateLedgerEntryForm, 
  formatZodError
} from '@/schemas/ledgerSchema';

export interface ValidationError {
  field: string;
  message: string;
}

export interface EntryFormData {
  tenant: string;
  amount: string;
  category: string;
  description: string;
  date: string;
}

export function validateLedgerEntry(data: EntryFormData): { isValid: boolean; errors: Record<string, string> } {
  // Security checks for all string inputs
  const stringFields = ['tenant', 'description'];
  for (const field of stringFields) {
    const value = data[field as keyof EntryFormData] as string;
    if (value && (detectSQLInjection(value) || detectXSS(value))) {
      return { isValid: false, errors: { [field]: 'Invalid characters detected in input' } };
    }
  }

  // Use Zod validation
  const zodResult = validateLedgerEntryForm(data);
  
  if (zodResult.success) {
    return { isValid: true, errors: {} };
  }
  
  const errors = formatZodError(zodResult.error);
  return { isValid: false, errors };
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/</g, '')
    .replace(/>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/[\x00-\x1f\x7f-\x9f]/g, ''); // Remove control characters
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

// Note: formatDate is available in dateUtils.ts - use that for consistency