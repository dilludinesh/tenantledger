import React, { useState } from 'react';
import { LedgerEntry } from '@/types/ledger';
import styles from './EntryRow.module.css';

interface EntryRowProps {
  entry: LedgerEntry & { id: string }; // Ensure id is required
  onEdit?: (entry: LedgerEntry & { id: string }) => void;
  onDelete?: (entryId: string) => void;
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

const formatAmount = (amount: number): string => {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  });
};

export const EntryRow: React.FC<EntryRowProps> = ({ entry, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const categoryStyle = getCategoryStyle(entry.category);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(entry);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(entry.id);
      setShowDeleteConfirm(false);
    }
  };

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
            {formatAmount(entry.amount)}
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
      <td className={styles.cell}>
        <div className="flex items-center justify-end space-x-2">
          {!showDeleteConfirm ? (
            <>
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-all hover:scale-105"
                  aria-label="Edit entry"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 rounded-full hover:bg-red-100 hover:text-red-700 transition-all hover:scale-105"
                  aria-label="Delete entry"
                >
                  Delete
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center space-x-1">
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-xs font-semibold bg-red-600 text-white rounded-full hover:bg-red-700 transition-all hover:scale-105 shadow-sm"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all hover:scale-105 shadow-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};