import React from 'react';
import { User } from 'firebase/auth';
import styles from '../glass.module.css';
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

interface DashboardHeaderProps {
  currentUser: User | null;
  demoUser: User | null;
  setShowSignOutConfirm: (show: boolean) => void;
  children?: React.ReactNode; // To allow passing EntryForm as children
  onExportCSV: () => void;
  filteredEntriesCount: number;
  totalEntriesCount: number;
  tenants: string[];
  onFilterChange: (filters: FilterOptions) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  demoUser,
  setShowSignOutConfirm,
  children,
  onExportCSV,
  filteredEntriesCount,
  totalEntriesCount,
  tenants,
  onFilterChange,
}) => {
  const [filters, setFilters] = React.useState<FilterOptions>({ categories: [] });

  const handleFilterChange = (key: keyof FilterOptions, value: string | string[] | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  return (
    <header className="mb-10">
      {/* Title Section */}
      <div className="text-center mb-10">
        <h1
          className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight title-gradient"
          aria-label="Tenant Ledger Dashboard"
          style={{
            display: 'inline-block',
            textShadow: '0 2px 4px rgba(0,0,0,0.05)',
            lineHeight: 'normal'
          }}
        >
          <span style={{ letterSpacing: '0.01em' }}>Tenant Ledger</span>
        </h1>
      </div>

      {/* User Info and Entry Form combined */}
      <div className="mb-8 w-full">
        <div className="card flex flex-col lg:flex-row items-start justify-between gap-0">
          {/* User Info Section */}
          {currentUser && (
            <div className="lg:w-[25%] lg:min-w-[250px] p-4">
              <div className="flex flex-col gap-3">
                {/* User Info */}
                <div>
                  <span className="filter-label">Welcome</span>
                  <span className="text-xl font-bold block title-gradient">
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                    {demoUser && <span className="text-xs text-blue-600 ml-2">(Demo)</span>}
                  </span>
                </div>

                {currentUser.email && (
                  <div style={{color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)'}}>
                    {currentUser.email}
                  </div>
                )}

                {/* User ID */}
                <div className="flex items-center gap-2">
                  <span className="filter-label">User ID:</span>
                  <span className="font-mono text-xs font-medium break-all title-gradient">
                    {currentUser.uid}
                  </span>
                </div>

                {/* Sign out button */}
                <button
                  onClick={() => setShowSignOutConfirm(true)}
                  className="btn btn-danger btn-sm w-fit"
                  aria-label="Sign out"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Entry Form Section */}
          <div className="flex-1 lg:w-[45%] p-4 border-l border-r border-gray-200">
            {children}
          </div>

          {/* Filters Section */}
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
        </div>
      </div>
    </header>
  );
};