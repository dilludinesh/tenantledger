import React from 'react';
import { LedgerEntry } from '@/types/ledger';
import styles from './EntryRow.module.css';

interface EntryRowProps {
  entry: LedgerEntry & { id: string }; // Ensure id is required
}

const getCategoryStyle = (category: string) => {
  switch (category) {
    case 'Rent':
      return styles.categoryRent;
    case 'Maintenance':
      return styles.categoryMaintenance;
    case 'Security Deposit':
      return styles.categorySecurity;
    case 'Utilities':
      return styles.categoryUtilities;
    default:
      return styles.categoryOther;
  }
};

export const EntryRow: React.FC<EntryRowProps> = ({ entry }) => {
  const categoryStyle = getCategoryStyle(entry.category);
  
  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <div className={styles.text}>
          {new Date(entry.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      </td>
      <td className={styles.cell}>
        <div className={styles.text}>
          {entry.tenant}
        </div>
      </td>
      <td className={styles.cell}>
        <div className="flex justify-end w-full">
          <div className={`${styles.text} ${styles.amount}`}>
            <span className={styles.currencySymbol}>₹</span>
            {entry.amount.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              useGrouping: true
            })}
          </div>
        </div>
      </td>
      <td className={styles.cell}>
        <span className={`${styles.category} ${categoryStyle}`}>
          {entry.category}
        </span>
      </td>
      <td className={styles.cell}>
        <div className={styles.description}>
          {entry.description || <span className={styles.emptyDescription}>-</span>}
        </div>
      </td>
    </tr>
  );
};