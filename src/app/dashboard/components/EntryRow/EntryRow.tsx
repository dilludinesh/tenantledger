import React, { useState } from 'react';
import { LedgerEntry } from '@/types/ledger';
import styles from './EntryRow.module.css';

interface EntryRowProps {
  entry: LedgerEntry & { id: string }; // Ensure id is required
  onEdit?: (entry: LedgerEntry & { id: string }) => void;
  onDelete?: (entryId: string) => void;
  isDeleting?: boolean;
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

export const EntryRow: React.FC<EntryRowProps> = ({ entry, onEdit, onDelete, isDeleting = false }) => {
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
      <td className={styles.cell}>
        <div className="flex items-center justify-end space-x-2">
          {!showDeleteConfirm ? (
            <>
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  aria-label="Edit entry"
                  disabled={isDeleting}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  aria-label="Delete entry"
                  disabled={isDeleting}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center space-x-1">
              <button
                onClick={handleDelete}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                disabled={isDeleting}
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
