import React from 'react';

interface DashboardActionBarProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  onExportCSV: () => void;
  filteredEntriesCount: number;
  totalEntriesCount: number;
}

export const DashboardActionBar: React.FC<DashboardActionBarProps> = ({
  showFilters,
  onToggleFilters,
  onExportCSV,
  filteredEntriesCount,
  totalEntriesCount,
}) => {
  return (
    /* Action Bar */
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onToggleFilters}
          className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'}`}
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            Filters {filteredEntriesCount !== totalEntriesCount && `(${filteredEntriesCount})`}
          </span>
        </button>
        
        <button
          onClick={onExportCSV}
          className="btn btn-success"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </span>
        </button>
      </div>
    </div>
  );
};