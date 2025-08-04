import { LedgerEntry, LedgerSummary, LedgerCategory, CATEGORIES } from '@/types/ledger';

export function calculateLedgerSummary(entries: Array<LedgerEntry & { id: string }>): LedgerSummary {
  if (entries.length === 0) {
    return {
      totalAmount: 0,
      totalEntries: 0,
      averageAmount: 0,
      categorySummary: CATEGORIES.reduce((acc, category) => {
        acc[category] = { count: 0, total: 0, percentage: 0 };
        return acc;
      }, {} as Record<LedgerCategory, { count: number; total: number; percentage: number }>),
      tenantSummary: {}
    };
  }

  const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalEntries = entries.length;
  const averageAmount = totalAmount / totalEntries;

  // Calculate category summary
  const categorySummary = CATEGORIES.reduce((acc, category) => {
    const categoryEntries = entries.filter(entry => entry.category === category);
    const categoryTotal = categoryEntries.reduce((sum, entry) => sum + entry.amount, 0);
    
    acc[category] = {
      count: categoryEntries.length,
      total: categoryTotal,
      percentage: totalAmount > 0 ? (categoryTotal / totalAmount) * 100 : 0
    };
    return acc;
  }, {} as Record<LedgerCategory, { count: number; total: number; percentage: number }>);

  // Calculate tenant summary
  const tenantSummary = entries.reduce((acc, entry) => {
    if (!acc[entry.tenant]) {
      acc[entry.tenant] = { count: 0, total: 0 };
    }
    acc[entry.tenant].count += 1;
    acc[entry.tenant].total += entry.amount;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  return {
    totalAmount,
    totalEntries,
    averageAmount,
    categorySummary,
    tenantSummary
  };
}

export function getTopTenants(summary: LedgerSummary, limit: number = 5): Array<{
  tenant: string;
  count: number;
  total: number;
  percentage: number;
}> {
  return Object.entries(summary.tenantSummary)
    .map(([tenant, data]) => ({
      tenant,
      count: data.count,
      total: data.total,
      percentage: summary.totalAmount > 0 ? (data.total / summary.totalAmount) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function getTopCategories(summary: LedgerSummary): Array<{
  category: LedgerCategory;
  count: number;
  total: number;
  percentage: number;
}> {
  return CATEGORIES
    .map(category => ({
      category,
      ...summary.categorySummary[category]
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.total - a.total);
}