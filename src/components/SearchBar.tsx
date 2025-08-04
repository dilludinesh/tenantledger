'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDebouncedSearch } from '@/hooks/useDebounce';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  showClearButton?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search entries...',
  className = '',
  debounceMs = 300,
  showClearButton = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchTerm, debouncedSearchTerm, setSearchTerm, isSearching } = useDebouncedSearch('', debounceMs);

  // Call onSearch when debounced value changes
  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className={`h-5 w-5 transition-colors ${isSearching ? 'text-blue-500' : 'text-gray-400'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-500"
          placeholder={placeholder}
          aria-label="Search entries"
        />
        
        {showClearButton && searchTerm && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Search status indicator */}
      {isSearching && (
        <div className="absolute top-full left-0 mt-1 text-xs text-blue-600 flex items-center space-x-1">
          <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full"></div>
          <span>Searching...</span>
        </div>
      )}
    </div>
  );
};

interface QuickFiltersProps {
  onFilterSelect: (filter: { type: 'category' | 'tenant' | 'amount'; value: string }) => void;
  recentTenants?: string[];
  className?: string;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  onFilterSelect,
  recentTenants = [],
  className = '',
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const quickFilters = [
    { type: 'category' as const, label: 'Rent', value: 'Rent' },
    { type: 'category' as const, label: 'Maintenance', value: 'Maintenance' },
    { type: 'category' as const, label: 'Utilities', value: 'Utilities' },
    { type: 'amount' as const, label: 'High Amount (>₹50k)', value: '50000+' },
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
        <span>Quick Filters</span>
      </button>

      {showFilters && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Categories</h4>
            <div className="space-y-1">
              {quickFilters.filter(f => f.type === 'category').map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    onFilterSelect(filter);
                    setShowFilters(false);
                  }}
                  className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {recentTenants.length > 0 && (
              <>
                <h4 className="text-sm font-medium text-gray-900 mb-2 mt-4">Recent Tenants</h4>
                <div className="space-y-1">
                  {recentTenants.slice(0, 5).map((tenant) => (
                    <button
                      key={tenant}
                      onClick={() => {
                        onFilterSelect({ type: 'tenant', value: tenant });
                        setShowFilters(false);
                      }}
                      className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded truncate"
                    >
                      {tenant}
                    </button>
                  ))}
                </div>
              </>
            )}

            <h4 className="text-sm font-medium text-gray-900 mb-2 mt-4">Amount</h4>
            <div className="space-y-1">
              {quickFilters.filter(f => f.type === 'amount').map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => {
                    onFilterSelect(filter);
                    setShowFilters(false);
                  }}
                  className="block w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};