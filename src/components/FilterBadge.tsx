/**
 * Filter badge component to show active filters
 */

import React from 'react';

interface FilterBadgeProps {
  count: number;
  total: number;
  onClear: () => void;
}

export const FilterBadge: React.FC<FilterBadgeProps> = ({ count, total, onClear }) => {
  if (count === total) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
      <span className="text-blue-800">
        Showing {count} of {total} entries
      </span>
      <button
        onClick={onClear}
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        Clear filters
      </button>
    </div>
  );
};