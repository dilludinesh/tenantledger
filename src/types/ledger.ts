export interface LedgerEntry {
  id?: string; // Firestore document ID (auto-generated)
  date: Date;
  tenant: string;
  amount: number;
  category: string;
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
