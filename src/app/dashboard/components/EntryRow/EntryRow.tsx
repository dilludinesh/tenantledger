import React from 'react';
import { LedgerEntry } from '@/types/ledger';

interface EntryRowProps {
  entry: LedgerEntry & { id: string }; // Ensure id is required
}

export const EntryRow: React.FC<EntryRowProps> = ({ entry }) => (
  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
    <td className="px-6 py-3 whitespace-nowrap">
      <div className="text-[15px] leading-5 font-normal text-gray-900 dark:text-gray-100">
        {new Date(entry.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })}
      </div>
    </td>
    <td className="px-6 py-3 whitespace-nowrap">
      <div className="text-[15px] leading-5 font-normal text-gray-900 dark:text-gray-100">
        {entry.tenant}
      </div>
    </td>
    <td className="px-6 py-3 whitespace-nowrap">
      <div className="flex justify-end w-full">
        <div className="text-[15px] leading-5 font-normal text-gray-900 dark:text-white tabular-nums">
          <span className="text-[13px] font-normal text-gray-500 dark:text-gray-400 mr-0.5">₹</span>
          {entry.amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true
          })}
        </div>
      </div>
    </td>
    <td className="px-6 py-3 whitespace-nowrap">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        entry.category === 'Rent' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
        entry.category === 'Maintenance' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
        entry.category === 'Security Deposit' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
        entry.category === 'Utilities' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      }`}>
        {entry.category}
      </span>
    </td>
    <td className="px-6 py-3">
      <div className="text-[15px] leading-5 font-normal text-gray-600 dark:text-gray-300 max-w-prose break-words whitespace-normal">
        {entry.description || <span className="text-gray-400">-</span>}
      </div>
    </td>
  </tr>
);