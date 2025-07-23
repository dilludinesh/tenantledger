import { LedgerEntry } from '@/types/ledger';

export function processLedgerEntries(
  entries: LedgerEntry[],
  userId: string
): Array<LedgerEntry & { id: string }> {
  return entries
    .filter((entry): entry is LedgerEntry & { id: string } => {
      if (!entry.id) {
        console.warn('Entry is missing required id, skipping:', entry);
        return false;
      }
      return true;
    })
    .map(entry => ({
      ...entry,
      userId: entry.userId || userId,
      createdAt: entry.createdAt || new Date(),
      updatedAt: entry.updatedAt || new Date(),
    }));
}
