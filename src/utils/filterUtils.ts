import { LedgerEntry } from '@/types/ledger';

export interface FilterOptions {
  dateFrom?: string;
  dateTo?: string;
  tenant?: string;
  categories: string[];
  amountMin?: number;
  amountMax?: number;
  searchTerm?: string;
}

export const filterEntries = (entries: Array<LedgerEntry & { id: string }>, filters: FilterOptions) => {
  return entries.filter(entry => {
    // Date range filter
    if (filters.dateFrom) {
      const entryDate = new Date(entry.date);
      const fromDate = new Date(filters.dateFrom);
      if (entryDate < fromDate) return false;
    }
    
    if (filters.dateTo) {
      const entryDate = new Date(entry.date);
      const toDate = new Date(filters.dateTo);
      if (entryDate > toDate) return false;
    }

    // Tenant filter
    if (filters.tenant && entry.tenant !== filters.tenant) {
      return false;
    }

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(entry.category)) {
      return false;
    }

    // Amount range filter
    if (filters.amountMin !== undefined && entry.amount < filters.amountMin) {
      return false;
    }
    
    if (filters.amountMax !== undefined && entry.amount > filters.amountMax) {
      return false;
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesDescription = entry.description.toLowerCase().includes(searchLower);
      const matchesTenant = entry.tenant.toLowerCase().includes(searchLower);
      if (!matchesDescription && !matchesTenant) return false;
    }

    return true;
  });
};
