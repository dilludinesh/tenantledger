"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEntries, addEntry, updateEntry } from '@/services/ledgerService';
import { LedgerEntry, LedgerCategory } from '@/types/ledger';
import { EntryForm } from './components/EntryForm/EntryForm';
import { EntriesTable } from './components/EntriesTable/EntriesTable';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import { FilterPanel } from '@/components/FilterPanel';
import { FilterBadge } from '@/components/FilterBadge';
import { HelpModal } from '@/components/HelpModal';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { processLedgerEntries } from '@/utils/ledgerUtils';
import { exportToCSV } from '@/utils/export';
import { useKeyboardShortcuts, createCommonShortcuts } from '@/hooks/useKeyboardShortcuts';
import styles from './glass.module.css';

interface FilterOptions {
  dateFrom?: string;
  dateTo?: string;
  tenant?: string;
  categories: string[];
  amountMin?: number;
  amountMax?: number;
  searchTerm?: string;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry & { id: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({ categories: [] });
  const [showHelp, setShowHelp] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      // Silent error handling for sign out
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Fetch entries using React Query
  const { data: entries = [], isLoading: isFetching } = useQuery<Array<LedgerEntry & { id: string }>>({
    queryKey: ['entries', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const ledgerEntries = await getEntries(user.uid);
      return processLedgerEntries(ledgerEntries, user.uid);
    },
    enabled: !!user,
  });

  // Add entry mutation
  const mutation = useMutation({
    mutationFn: async (data: {
      values: {
        tenant: string;
        amount: string;
        category: string;
        description: string;
        date: string;
      };
      entryId?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      const { values, entryId } = data;

      const entryData: Omit<LedgerEntry, 'id' | 'createdAt' | 'updatedAt'> = {
        tenant: values.tenant,
        amount: Number(values.amount) || 0,
        category: values.category as LedgerCategory,
        description: values.description,
        date: new Date(values.date),
        userId: user.uid,
      };

      if (entryId) {
        await updateEntry(user.uid, entryId, entryData);
      } else {
        await addEntry(entryData, user.uid);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries', user?.uid] });
      setEditingEntry(null);
      toast.success('Entry saved successfully!');
    },
    onError: (error) => {
      toast.error(`Error saving entry: ${error.message}`);
    },
  });

  const handleEdit = (entry: LedgerEntry & { id: string }) => {
    setEditingEntry(entry);
  };

  // Filter entries based on current filters
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Date range filter
      if (filters.dateFrom) {
        const entryDate = new Date(entry.date);
        const fromDate = new Date(filters.dateFrom);
        if (entryDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const entryDate = new Date(entry.date);
        const toDate = new Date(filters.dateTo);
        if (entryDate > toDate) return false;
      }

      // Tenant filter
      if (filters.tenant && entry.tenant !== filters.tenant) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(entry.category)) {
        return false;
      }

      // Amount range filter
      if (filters.amountMin !== undefined && entry.amount < filters.amountMin) {
        return false;
      }
      
      if (filters.amountMax !== undefined && entry.amount > filters.amountMax) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesDescription = entry.description.toLowerCase().includes(searchLower);
        const matchesTenant = entry.tenant.toLowerCase().includes(searchLower);
        if (!matchesDescription && !matchesTenant) return false;
      }

      return true;
    });
  }, [entries, filters]);

  // Get unique tenants for filter dropdown
  const uniqueTenants = useMemo(() => {
    return Array.from(new Set(entries.map(entry => entry.tenant))).sort();
  }, [entries]);

  const handleExportCSV = () => {
    const entriesToExport = filteredEntries.length > 0 ? filteredEntries : entries;
    const filename = `tenant-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(entriesToExport, filename);
    toast.success(`Exported ${entriesToExport.length} entries to CSV`);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({ categories: [] });
    setShowFilters(false);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts(createCommonShortcuts({
    onExport: handleExportCSV,
    onToggleFilters: () => setShowFilters(!showFilters),
    onNewEntry: () => {
      setEditingEntry(null);
      // Focus on first form input
      setTimeout(() => {
        const firstInput = document.querySelector('input[name="tenant"]') as HTMLInputElement;
        firstInput?.focus();
      }, 100);
    }
  }));

  if (loading || isFetching || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          {/* Title Section */}
          <div className="text-center mb-10">
            <h1 
              className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight"
              aria-label="Tenant Ledger Dashboard"
              style={{
                background: 'linear-gradient(90deg, #3b82f6, rgb(167, 41, 240))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                textShadow: '0 2px 4px rgba(0,0,0,0.05)',
                letterSpacing: '0.01em'
              }}
            >
              Tenant Ledger
            </h1>
          </div>

          {/* User Info and Sign Out Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10 w-full">
            {/* Welcome/User Info left */}
            <div className="flex flex-col w-full sm:w-auto">
              {user && (
                <div className="flex flex-col gap-1 p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm">
                  <span className="text-xs font-medium text-gray-500">Welcome</span>
                  <span 
                    className="text-xl font-normal"
                    style={{
                      background: 'linear-gradient(90deg, #3b82f6, rgb(167, 41, 240))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </span>
                  {user.email && (
                    <span className="text-gray-600 text-sm font-medium truncate max-w-[220px]">
                      {user.email}
                    </span>
                  )}
                  <span 
                    className="font-mono text-xs font-normal mt-1"
                    style={{
                      background: 'linear-gradient(90deg, #3b82f6, rgb(167, 41, 240))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    <span className="text-gray-500">User ID: </span>
                    <span>{user.uid}</span>
                  </span>
                </div>
              )}
            </div>
            {/* Sign Out right */}
            <div className="flex flex-col items-end w-full sm:w-auto sm:items-end">
              <button
                onClick={() => setShowSignOutConfirm(true)}
                className="btn-signout flex items-center space-x-2 px-6 py-2 text-base font-bold shadow-md"
                aria-label="Sign out"
                style={{ minWidth: 120 }}
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
          </div>
        </header>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                Filters {filteredEntries.length !== entries.length && `(${filteredEntries.length})`}
              </span>
            </button>
            
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </span>
            </button>

            <button
              onClick={() => setShowHelp(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Help
              </span>
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {filteredEntries.length} of {entries.length} entries
          </div>
        </div>

        {/* Filter Badge */}
        <FilterBadge 
          count={filteredEntries.length}
          total={entries.length}
          onClear={clearFilters}
        />

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6">
            <FilterPanel 
              onFilterChange={handleFilterChange}
              tenants={uniqueTenants}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Entry Form */}
          <div className="lg:col-span-1">
            <div className={styles.glassCard} style={{borderRadius: 24, boxShadow: '0 2px 16px 0 rgba(31,38,135,0.10)'}}>
              <EntryForm
                onSubmit={(values) => mutation.mutate({ values, entryId: editingEntry?.id })}
                isLoading={mutation.isPending}
                entryToEdit={editingEntry}
                onCancelEdit={() => setEditingEntry(null)}
              />
            </div>
          </div>
          {/* Entries Table */}
          <div className="lg:col-span-2">
            <div className={styles.glassCard} style={{borderRadius: 24, boxShadow: '0 2px 16px 0 rgba(31,38,135,0.10)'}}>
              <EntriesTable
                entries={filteredEntries}
                isLoading={isFetching}
                onEdit={handleEdit}
              />
            </div>
          </div>
        </div>

        {/* Help Modal */}
        <HelpModal 
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />

        {/* Sign Out Confirmation Modal */}
        {showSignOutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop with soft blur */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setShowSignOutConfirm(false)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md mx-4 transform transition-all">
              <div className="text-center">
                {/* Icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Sign Out
                </h3>
                
                {/* Message */}
                <p className="text-gray-600 mb-8">
                  Are you sure you want to sign out of your account?
                </p>
                
                {/* Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowSignOutConfirm(false)}
                    className="px-6 py-3 rounded-xl transition-colors"
                    style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      fontWeight: '600',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="px-6 py-3 rounded-xl transition-colors"
                    style={{
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'linear-gradient(90deg, #ff4b2b 0%, #ff416c 100%)';
                      e.target.style.color = 'white';
                      e.target.style.boxShadow = '0 4px 16px 0 rgba(255,65,108,0.18)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#e5e7eb';
                      e.target.style.color = '#374151';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}