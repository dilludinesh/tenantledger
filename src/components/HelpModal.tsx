/**
 * Help modal component showing keyboard shortcuts and tips
 */

import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + E', description: 'Export data to CSV' },
    { key: 'Ctrl + F', description: 'Toggle filters panel' },
    { key: 'Ctrl + N', description: 'Focus on new entry form' },
    { key: '/', description: 'Focus search (when filters open)' },
    { key: 'Esc', description: 'Close modals and panels' },
  ];

  const tips = [
    'Use filters to narrow down your entries by date, tenant, category, or amount',
    'Export your data regularly for backup and tax purposes',
    'The summary cards show your financial overview at a glance',
    'Click on any entry to edit it quickly',
    'Use descriptive names for tenants to make searching easier',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="modal max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Help & Shortcuts</h2>
            <button
              onClick={onClose}
              className="btn btn-outline btn-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Keyboard Shortcuts */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips & Tricks</h3>
              <div className="space-y-3">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600 text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-custom">
            <div className="badge badge-primary p-4 help-section">
              <div>
                <h4 className="font-semibold mb-2">Need more help?</h4>
                <p className="text-sm">
                  This tenant ledger helps you track payments, expenses, and manage your rental properties efficiently. 
                  All your data is securely stored and accessible only to you.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};