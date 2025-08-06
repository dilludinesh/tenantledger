import React from 'react';
import { User } from 'firebase/auth';
import styles from '../glass.module.css';
import formStyles from './EntryForm/EntryForm.module.css';
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

  const clearFilters = () => {
    const emptyFilters: FilterOptions = { categories: [] };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
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
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 mb-8 w-full">
        <div className={`${styles.glassCard} text-base w-full shadow-sm flex flex-col lg:flex-row items-stretch justify-between gap-0 p-4`} style={{ borderRadius: 20 }}>
          {/* User Info Section with attached divider */}
          {currentUser && (
            <div className="flex lg:w-[25%] lg:min-w-[250px]">
              <div className="flex flex-col gap-2 flex-1">
                {/* User Info */}
                <div className="mb-1">
                  <span className="text-xs text-gray-400 block">Welcome</span>
                  <span
                    className="text-lg font-semibold block"
                    style={{
                      background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, rgb(167, 41, 240) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
                    {demoUser && <span className="text-xs text-blue-600 ml-1">(Demo)</span>}
                  </span>
                </div>

                {currentUser.email && (
                  <div className="text-gray-500 text-sm truncate">
                    {currentUser.email}
                  </div>
                )}

                {/* Always visible UID - inline */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">User ID:</span>
                  <span
                    className="font-mono text-xs break-all font-medium"
                    style={{
                      background: 'linear-gradient(90deg, #3b82f6, rgb(167, 41, 240))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    {currentUser.uid}
                  </span>
                </div>

                {/* Sign out button - previous style */}
                <button
                  onClick={() => setShowSignOutConfirm(true)}
                  className="btn-signout flex items-center justify-center space-x-2 px-4 py-2 text-sm font-bold shadow-md mt-6 w-fit"
                  aria-label="Sign out"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Divider attached to user info */}
              <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent my-2 mr-4"></div>
            </div>
          )}

          {/* Entry Form Section */}
          <div className="flex-1 lg:w-[45%] mt-3 lg:mt-0">
            {children}
          </div>

          {/* Second divider */}
          <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent mx-4 my-2"></div>

          {/* Compact Filters Grid */}
          <div className="lg:w-[25%] lg:min-w-[200px] mt-3 lg:mt-0 space-y-3">
            {/* More horizontal 3x2 Grid Layout */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tenant</label>
                <select
                  value={filters.tenant || ''}
                  onChange={(e) => handleFilterChange('tenant', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  {tenants.map(tenant => (
                    <option key={tenant} value={tenant}>{tenant}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.amountMin || ''}
                  onChange={(e) => handleFilterChange('amountMin', parseFloat(e.target.value) || undefined)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select
                  value={filters.categories[0] || ''}
                  onChange={(e) => handleFilterChange('categories', e.target.value ? [e.target.value] : [])}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Search descriptions..."
                  value={filters.searchTerm || ''}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={onExportCSV}
              className="w-full px-3 py-2 text-xs font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 transition-all hover:scale-105 shadow-sm"
            >
              Export
            </button>

            {/* Results Count */}
            {filteredEntriesCount !== totalEntriesCount && (
              <div className="text-xs text-gray-500 text-center">
                {filteredEntriesCount} of {totalEntriesCount} entries
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
