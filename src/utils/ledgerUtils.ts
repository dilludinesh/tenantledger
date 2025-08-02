import { LedgerEntry } from '@/types/ledger';

export function processLedgerEntries(
  entries: LedgerEntry[],
  userId: string
): Array<LedgerEntry & { id: string }> {
  return entries
    .filter((entry): entry is LedgerEntry & { id: string } => {
      if (!entry.id) {
        return false;
      }
      // Filter by userId
      return entry.userId === userId;
    })
    .map(entry => ({
      ...entry,
      userId: entry.userId || userId,
      createdAt: entry.createdAt || new Date(),
      updatedAt: entry.updatedAt || new Date(),
    }));
}

export interface LedgerSummary {
  totalEntries: number;
  totalAmount: number;
  rentTotal: number;
  maintenanceTotal: number;
  securityDepositTotal: number;
  utilitiesTotal: number;
  otherTotal: number;
  uniqueTenants: number;
}

export function calculateSummary(entries: Array<LedgerEntry & { id: string }>): LedgerSummary {
  const summary: LedgerSummary = {
    totalEntries: entries.length,
    totalAmount: 0,
    rentTotal: 0,
    maintenanceTotal: 0,
    securityDepositTotal: 0,
    utilitiesTotal: 0,
    otherTotal: 0,
    uniqueTenants: 0
  };

  if (entries.length === 0) {
    return summary;
  }

  // Calculate totals by category
  entries.forEach(entry => {
    summary.totalAmount += entry.amount;
    
    switch (entry.category) {
      case 'Rent':
        summary.rentTotal += entry.amount;
        break;
      case 'Maintenance':
        summary.maintenanceTotal += entry.amount;
        break;
      case 'Security Deposit':
        summary.securityDepositTotal += entry.amount;
        break;
      case 'Utilities':
        summary.utilitiesTotal += entry.amount;
        break;
      case 'Other':
        summary.otherTotal += entry.amount;
        break;
      default:
        summary.otherTotal += entry.amount;
        break;
    }
  });

  // Calculate unique tenants
  const uniqueTenants = new Set(entries.map(entry => entry.tenant));
  summary.uniqueTenants = uniqueTenants.size;

  return summary;
}