import { CATEGORIES } from '@/types/ledger';

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

export function validateEntryForm(data: EntryFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Tenant validation
  if (!data.tenant.trim()) {
    errors.push({ field: 'tenant', message: 'Tenant name is required' });
  } else if (data.tenant.trim().length < 2) {
    errors.push({ field: 'tenant', message: 'Tenant name must be at least 2 characters' });
  } else if (data.tenant.trim().length > 100) {
    errors.push({ field: 'tenant', message: 'Tenant name must be less than 100 characters' });
  }

  // Amount validation
  if (!data.amount.trim()) {
    errors.push({ field: 'amount', message: 'Amount is required' });
  } else {
    const amount = parseFloat(data.amount);
    if (isNaN(amount)) {
      errors.push({ field: 'amount', message: 'Amount must be a valid number' });
    } else if (amount <= 0) {
      errors.push({ field: 'amount', message: 'Amount must be greater than 0' });
    } else if (amount > 10000000) {
      errors.push({ field: 'amount', message: 'Amount must be less than ₹1,00,00,000' });
    }
  }

  // Category validation
  if (!data.category) {
    errors.push({ field: 'category', message: 'Category is required' });
  } else if (!CATEGORIES.includes(data.category as typeof CATEGORIES[number])) {
    errors.push({ field: 'category', message: 'Invalid category selected' });
  }

  // Description validation
  if (data.description.length > 500) {
    errors.push({ field: 'description', message: 'Description must be less than 500 characters' });
  }

  // Date validation
  if (!data.date) {
    errors.push({ field: 'date', message: 'Date is required' });
  } else {
    const selectedDate = new Date(data.date);
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);

    if (isNaN(selectedDate.getTime())) {
      errors.push({ field: 'date', message: 'Invalid date format' });
    } else if (selectedDate < oneYearAgo) {
      errors.push({ field: 'date', message: 'Date cannot be more than 1 year ago' });
    } else if (selectedDate > oneYearFromNow) {
      errors.push({ field: 'date', message: 'Date cannot be more than 1 year in the future' });
    }
  }

  return errors;
}

export function validateLedgerEntry(data: EntryFormData): { isValid: boolean; errors: Record<string, string> } {
  const validationErrors = validateEntryForm(data);
  const errors: Record<string, string> = {};
  
  validationErrors.forEach(error => {
    errors[error.field] = error.message;
  });
  
  return {
    isValid: validationErrors.length === 0,
    errors
  };
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}
