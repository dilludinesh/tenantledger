import React from 'react';
import { CATEGORIES } from '@/types/ledger';

interface FilterOptions {
  dateFrom?: string;
  dateTo?: string;
  tenant?: string;
  categories: string[];
  amountMin?: number;
  amountMax?: number;
  searchTerm?: string;
}

interface DashboardFiltersProps {
  tenants: string[];
  onFilterChange: (filters: FilterOptions) => void;
  filteredEntriesCount: number;
  totalEntriesCount: number;
  onExportCSV: () => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  tenants,
  onFilterChange,
  filteredEntriesCount,
  totalEntriesCount,
  onExportCSV,
}) => {
  const [filters, setFilters] = React.useState<FilterOptions>({ categories: [] });

  const handleFilterChange = (key: keyof FilterOptions, value: string | string[] | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="lg:w-[30%] lg:min-w-[240px] p-4">
      <div className="space-y-4">
        {/* Filter Grid */}
        <div>
          <h3 className="text-center text-lg font-semibold mb-4">Filters</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[120px]">
              <label className="filter-label">Date</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="filter-label">Tenant</label>
              <select
                value={filters.tenant || ''}
                onChange={(e) => handleFilterChange('tenant', e.target.value)}
                className="filter-input"
              >
                <option value="">All</option>
                {tenants.map(tenant => (
                  <option key={tenant} value={tenant}>{tenant}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="filter-label">Amount</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.amountMin || ''}
                onChange={(e) => handleFilterChange('amountMin', parseFloat(e.target.value) || undefined)}
                className="filter-input"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="filter-label">Category</label>
              <select
                value={filters.categories[0] || ''}
                onChange={(e) => handleFilterChange('categories', e.target.value ? [e.target.value] : [])}
                className="filter-input"
              >
                <option value="">All</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="filter-label">Description</label>
            <input
              type="text"
              placeholder="Search descriptions..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        {/* Actions */}
        <div>
          <h3 style={{fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--foreground)', marginBottom: 'var(--spacing-md)'}}>Actions</h3>
          <button
            onClick={onExportCSV}
            className="btn btn-success w-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Results Count */}
        {filteredEntriesCount !== totalEntriesCount && (
          <div className="badge badge-primary">
            <span>{filteredEntriesCount} of {totalEntriesCount} entries</span>
          </div>
        )}
      </div>
    </div>
  );
};