import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LedgerEntry } from '@/types/ledger';
import { deleteEntry } from '@/services/ledgerService';
import { useAuth } from '@/context/AuthContext';
import { EntryRow } from '../EntryRow/EntryRow';
import styles from './EntriesTable.module.css';

interface EntriesTableProps {
  entries: Array<LedgerEntry & { id: string }>;
  isLoading?: boolean;
  onEdit: (entry: LedgerEntry & { id: string }) => void;
  selectedEntries: Array<LedgerEntry & { id: string }>;
  setSelectedEntries: React.Dispatch<React.SetStateAction<Array<LedgerEntry & { id: string }>>>;
}

export const EntriesTable: React.FC<EntriesTableProps> = ({
  entries,
  isLoading = false,
  onEdit,
  selectedEntries,
  setSelectedEntries,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (entryId: string) => {
      if (!user) throw new Error('User not authenticated');
      await deleteEntry(user.uid, entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries', user?.uid] });
      toast.success('Entry deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error deleting entry: ${error.message}`);
    },
  });

  const handleDelete = (entryId: string) => {
    deleteMutation.mutate(entryId);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEntries(entries);
    } else {
      setSelectedEntries([]);
    }
  };

  const handleSelectEntry = (entry: LedgerEntry & { id: string }, isSelected: boolean) => {
    if (isSelected) {
      setSelectedEntries((prev) => [...prev, entry]);
    } else {
      setSelectedEntries((prev) => prev.filter((selected) => selected.id !== entry.id));
    }
  };

  const allEntriesSelected = selectedEntries.length === entries.length && entries.length > 0;

  if (isLoading) {
    return (
      <div className={styles.loadingRow}>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-gray-200 rounded col-span-2"></div>
                <div className="h-2 bg-gray-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={styles.emptyState}>
        <svg
          className={styles.emptyIcon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className={styles.emptyTitle}>No entries yet</h3>
        <p className={styles.emptyDescription}>Get started by adding a new entry above.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableHead}>
            <th scope="col" className="w-12 px-4 py-3">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded"
                checked={allEntriesSelected}
                onChange={handleSelectAll}
              />
            </th>
            <th scope="col" className={styles.tableHeader}>
              Date
            </th>
            <th scope="col" className={styles.tableHeader}>
              Tenant
            </th>
            <th scope="col" className={`${styles.tableHeader} text-right w-48`}>
              <div className="flex justify-end items-center w-full">
                <span>Amount</span>
              </div>
            </th>
            <th scope="col" className={styles.tableHeader}>
              Category
            </th>
            <th scope="col" className={styles.tableHeader}>
              Description
            </th>
            <th scope="col" className={`${styles.tableHeader} text-right`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {entries.map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              onEdit={onEdit}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === entry.id}
              onSelect={handleSelectEntry}
              isSelected={selectedEntries.some((selected) => selected.id === entry.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
