'use client';

import React, { useState } from 'react';
import { LedgerEntry } from '@/types/ledger';
import { useBulkDeleteEntries } from '@/hooks/useLedgerData';

interface BulkActionsProps {
  selectedEntries: Array<LedgerEntry & { id: string }>;
  onClearSelection: () => void;
  onExportSelected: () => void;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedEntries,
  onClearSelection,
  onExportSelected,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const bulkDeleteMutation = useBulkDeleteEntries();

  const handleBulkDelete = async () => {
    if (selectedEntries.length === 0) return;

    try {
      const entryIds = selectedEntries.map(entry => entry.id);
      await bulkDeleteMutation.mutateAsync(entryIds);
      onClearSelection();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const totalAmount = selectedEntries.reduce((sum, entry) => sum + entry.amount, 0);

  if (selectedEntries.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-4 min-w-96">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {selectedEntries.length}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedEntries.length} entries selected
              </p>
              <p className="text-xs text-gray-500">
                Total: ₹{totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClearSelection}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear selection"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onExportSelected}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export</span>
            </span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
            disabled={bulkDeleteMutation.isPending}
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>{bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete'}</span>
            </span>
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                Delete {selectedEntries.length} entries?
              </h3>
              
              <p className="text-sm text-gray-500 text-center mb-6">
                This action cannot be undone. The selected entries will be permanently deleted.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors text-sm font-medium"
                  disabled={bulkDeleteMutation.isPending}
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm font-medium"
                  disabled={bulkDeleteMutation.isPending}
                >
                  {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};