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
    <div className="badge badge-primary">
      <span>
        Showing {count} of {total} entries
      </span>
      <button
        onClick={onClear}
        className="text-current hover:opacity-80 font-medium transition-opacity"
      >
        Clear filters
      </button>
    </div>
  );
};