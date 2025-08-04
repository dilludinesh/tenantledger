import { z } from 'zod';
import { CATEGORIES } from '@/types/ledger';

// Base entry schema
export const ledgerEntrySchema = z.object({
  tenant: z
    .string()
    .min(2, 'Tenant name must be at least 2 characters')
    .max(100, 'Tenant name must be less than 100 characters')
    .trim()
    .refine(
      (val) => !/<script|javascript:|on\w+=/i.test(val),
      'Invalid characters detected in tenant name'
    ),
  
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(10000000, 'Amount must be less than ₹1,00,00,000')
    .finite('Amount must be a valid number'),
  
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid category' })
  }),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .default('')
    .transform((val) => val?.trim() || '')
    .refine(
      (val) => !/<script|javascript:|on\w+=/i.test(val),
      'Invalid characters detected in description'
    ),
  
  date: z
    .date()
    .refine(
      (date) => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return date >= oneYearAgo;
      },
      'Date cannot be more than 1 year ago'
    )
    .refine(
      (date) => {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return date <= oneYearFromNow;
      },
      'Date cannot be more than 1 year in the future'
    ),
});

// Form input schema (before transformation)
export const ledgerEntryFormSchema = z.object({
  tenant: z.string().min(1, 'Tenant name is required'),
  amount: z.string().min(1, 'Amount is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional().default(''),
  date: z.string().min(1, 'Date is required'),
}).transform((data) => {
  const amount = parseFloat(data.amount);
  if (isNaN(amount)) {
    throw new z.ZodError([{
      code: 'custom',
      path: ['amount'],
      message: 'Amount must be a valid number'
    }]);
  }

  const date = new Date(data.date);
  if (isNaN(date.getTime())) {
    throw new z.ZodError([{
      code: 'custom',
      path: ['date'],
      message: 'Invalid date format'
    }]);
  }

  return {
    tenant: data.tenant.trim(),
    amount,
    category: data.category as typeof CATEGORIES[number],
    description: data.description?.trim() || '',
    date,
  };
}).pipe(ledgerEntrySchema);

// Filter schema
export const ledgerFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  tenant: z.string().optional(),
  categories: z.array(z.enum(CATEGORIES)).default([]),
  amountMin: z.number().positive().optional(),
  amountMax: z.number().positive().optional(),
  searchTerm: z.string().optional(),
}).refine(
  (data) => {
    if (data.amountMin && data.amountMax) {
      return data.amountMin <= data.amountMax;
    }
    return true;
  },
  {
    message: 'Minimum amount must be less than or equal to maximum amount',
    path: ['amountMin']
  }
).refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
  },
  {
    message: 'From date must be before or equal to to date',
    path: ['dateFrom']
  }
);

// Pagination schema
export const paginationSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(50),
  cursor: z.string().optional(),
  orderBy: z.enum(['date', 'createdAt', 'amount']).optional().default('date'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Export types
export type LedgerEntryInput = z.input<typeof ledgerEntrySchema>;
export type LedgerEntryOutput = z.output<typeof ledgerEntrySchema>;
export type LedgerEntryFormInput = z.input<typeof ledgerEntryFormSchema>;
export type LedgerFiltersInput = z.input<typeof ledgerFiltersSchema>;
export type PaginationInput = z.input<typeof paginationSchema>;

// Validation helper functions
export function validateLedgerEntry(data: unknown) {
  return ledgerEntrySchema.safeParse(data);
}

export function validateLedgerEntryForm(data: unknown) {
  return ledgerEntryFormSchema.safeParse(data);
}

export function validateLedgerFilters(data: unknown) {
  return ledgerFiltersSchema.safeParse(data);
}

export function validatePagination(data: unknown) {
  return paginationSchema.safeParse(data);
}

// Error formatting helper
export function formatZodError(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });
  
  return formattedErrors;
}