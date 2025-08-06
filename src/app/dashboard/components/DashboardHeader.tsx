import { useState, useCallback } from 'react';
import { LedgerCategory } from '@/types/ledger';

interface FilterState {
  dateFrom?: string;
  tenant?: string;
  amountMin?: number;
  searchTerm?: string;
  categories: LedgerCategory[];
}

const CATEGORIES: LedgerCategory[] = [
  'Rent',
  'Maintenance',
  'Security Deposit',
  'Utilities',
  'Other'
];

interface DashboardHeaderProps {
  currentUser: any; // Consider replacing 'any' with proper User type
  demoUser?: boolean;
  tenants: string[];
  filteredEntriesCount: number;
  totalEntriesCount: number;
  onFilterChange: (filters: any) => void; // Updated to match usage
  onExportCSV: () => void;
  setShowSignOutConfirm: (show: boolean) => void;
  children?: React.ReactNode;
}

const defaultFilters: FilterState = {
  categories: []
};

export default function DashboardHeader({
  currentUser,
  demoUser = false,
  tenants,
  filteredEntriesCount,
  totalEntriesCount,
  onFilterChange,
  onExportCSV,
  setShowSignOutConfirm,
  children
}: DashboardHeaderProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value
      };
      
      // Call the parent's onFilterChange with the new filters
      onFilterChange(newFilters);
      
      return newFilters;
    });
  }, [onFilterChange]);
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

      {/* User Info and Entry Form Section */}
      {currentUser && (
        <div className="mb-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="lg:col-span-1">
              <div className="card p-4 h-full">
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
            </div>

            {/* Entry Form */}
            <div className="lg:col-span-2">
              <div className="card p-4 h-full">
                {children}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry Form and Filters Section */}
      <div className="mb-8 w-full">
        <div className="card">
          {/* Entry Form Section */}
          <div className="p-4 border-b border-gray-200">
            {children}
          </div>

          {/* Filters Section */}
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-center">Filters</h2>
            <div className="flex flex-wrap gap-4 items-end">
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
                  value={''}
                  onChange={(e) => handleFilterChange('amountMin', parseFloat(e.target.value) || undefined)}
                  className="filter-input"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="filter-label">Category</label>
                <select
                  value={''}
                  onChange={(e) => handleFilterChange('categories', e.target.value ? [e.target.value as LedgerCategory] : [])}
                  className="filter-input"
                >
                  <option value="">All</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="filter-label">Description</label>
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.searchTerm || ''}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="flex items-end pb-1">
                <button
                  onClick={onExportCSV}
                  className="btn btn-success"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
            
            {/* Results Count */}
            {filteredEntriesCount !== totalEntriesCount && (
              <div className="badge badge-primary mt-4">
                <span>{filteredEntriesCount} of {totalEntriesCount} entries</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}