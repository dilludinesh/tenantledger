import React from 'react';
import { LedgerEntry } from '@/types/ledger';
import { EntryRow } from '../EntryRow/EntryRow';

interface EntriesTableProps {
  entries: Array<LedgerEntry & { id: string }>;
  isLoading?: boolean;
}

export const EntriesTable: React.FC<EntriesTableProps> = ({ entries, isLoading = false }) => {
  if (isLoading) {
    return null; // Return nothing while loading
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">No entries yet</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new entry above.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr className="bg-gradient-to-r from-blue-600 to-purple-600">
            <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-white/90 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-white/90 uppercase tracking-wider">
              Tenant
            </th>
            <th scope="col" className="px-6 py-3.5 text-right text-sm font-semibold text-white/90 uppercase tracking-wider w-48">
              <div className="flex justify-end items-center w-full">
                <span>Amount</span>
              </div>
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-white/90 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-white/90 uppercase tracking-wider">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
