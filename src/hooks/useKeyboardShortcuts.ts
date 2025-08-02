/**
 * Custom hook for keyboard shortcuts
 */

import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return shortcuts;
};

// Common shortcuts
export const createCommonShortcuts = (callbacks: {
  onExport?: () => void;
  onToggleFilters?: () => void;
  onFocusSearch?: () => void;
  onNewEntry?: () => void;
}) => [
  {
    key: 'e',
    ctrlKey: true,
    callback: callbacks.onExport || (() => {}),
    description: 'Export data (Ctrl+E)'
  },
  {
    key: 'f',
    ctrlKey: true,
    callback: callbacks.onToggleFilters || (() => {}),
    description: 'Toggle filters (Ctrl+F)'
  },
  {
    key: '/',
    callback: callbacks.onFocusSearch || (() => {}),
    description: 'Focus search (/)'
  },
  {
    key: 'n',
    ctrlKey: true,
    callback: callbacks.onNewEntry || (() => {}),
    description: 'New entry (Ctrl+N)'
  }
];