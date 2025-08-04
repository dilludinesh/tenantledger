export interface LedgerEntry {
  id?: string; // Firestore document ID (auto-generated)
  date: Date;
  tenant: string;
  amount: number;
  category: LedgerCategory;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string; // To separate entries by user
}

export const CATEGORIES = [
  'Rent',
  'Maintenance',
  'Security Deposit',
  'Utilities',
  'Other'
] as const;

export type LedgerCategory = typeof CATEGORIES[number];

// Filter and search types
export interface LedgerFilters {
  dateFrom?: string;
  dateTo?: string;
  tenant?: string;
  categories: LedgerCategory[];
  amountMin?: number;
  amountMax?: number;
  searchTerm?: string;
}

// Summary statistics
export interface LedgerSummary {
  totalAmount: number;
  totalEntries: number;
  averageAmount: number;
  categorySummary: Record<LedgerCategory, {
    count: number;
    total: number;
    percentage: number;
  }>;
  tenantSummary: Record<string, {
    count: number;
    total: number;
  }>;
}
