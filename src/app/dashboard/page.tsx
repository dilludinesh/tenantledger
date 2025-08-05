"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEntries, addEntry, updateEntry } from '@/services/ledgerService';
import { LedgerEntry, LedgerCategory } from '@/types/ledger';
import { EntryForm } from './components/EntryForm/EntryForm';
import { EntriesTable } from './components/EntriesTable/EntriesTable';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardActionBar } from './components/DashboardActionBar';
import { FilterPanel } from '@/components/FilterPanel';
import { FilterBadge } from '@/components/FilterBadge';
import { BulkActions } from '@/components/BulkActions';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { processLedgerEntries } from '@/utils/ledgerUtils';
import { exportToCSV } from '@/utils/export';
import { useKeyboardShortcuts, createCommonShortcuts } from '@/hooks/useKeyboardShortcuts';
import { filterEntries, FilterOptions } from '@/utils/filterUtils';
import { HelpModal } from '@/components/HelpModal';
import styles from './glass.module.css';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry & { id: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({ categories: [] });
  const [selectedEntries, setSelectedEntries] = useState<Array<LedgerEntry & { id: string }>>([]);

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

  // Filter entries based on current filters and search term
  const filteredEntries = useMemo(() => filterEntries(entries, filters), [entries, filters]);

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
        <DashboardHeader
          currentUser={user}
          demoUser={null}
          setShowSignOutConfirm={setShowSignOutConfirm}
          entryForm={
            <div className={styles.glassCard} style={{borderRadius: 20, boxShadow: '0 2px 16px 0 rgba(31,38,135,0.10)'}}>
              <EntryForm
                onSubmit={(values) => mutation.mutate({ values, entryId: editingEntry?.id })}
                isLoading={mutation.isPending}
                entryToEdit={editingEntry}
                onCancelEdit={() => setEditingEntry(null)}
              />
            </div>
          }
        />

        <DashboardActionBar
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onExportCSV={handleExportCSV}
          filteredEntriesCount={filteredEntries.length}
          totalEntriesCount={entries.length}
        />

        

        {/* Filter Badge */}
        <FilterBadge 
          count={filteredEntries.length}
          total={entries.length}
          onClear={clearFilters}
        />

        {/* Filters Panel */}
        {showFilters && !showSignOutConfirm && (
          <div className={`mb-6 ${styles.glassCard}`} style={{borderRadius: 20, boxShadow: '0 2px 16px 0 rgba(31,38,135,0.10)'}}>
            <FilterPanel 
              onFilterChange={handleFilterChange}
              tenants={uniqueTenants}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          {/* Entries Table */}
          <div className="lg:col-span-2">
            <div className={styles.glassCard} style={{borderRadius: 20, boxShadow: '0 2px 16px 0 rgba(31,38,135,0.10)'}}>
              <EntriesTable
                entries={filteredEntries}
                isLoading={isFetching}
                onEdit={handleEdit}
                selectedEntries={selectedEntries}
                setSelectedEntries={setSelectedEntries}
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <BulkActions
          selectedEntries={selectedEntries}
          onClearSelection={() => setSelectedEntries([])}
          onExportSelected={() => {
            exportToCSV(selectedEntries, `tenant-ledger-selected-${new Date().toISOString().split('T')[0]}.csv`);
            toast.success(`Exported ${selectedEntries.length} selected entries to CSV`);
          }}
        />

        {/* Help Modal */}
        <HelpModal 
          isOpen={showHelp && !showSignOutConfirm}
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
                <div className="flex gap-8 justify-center">
                  <button
                    onClick={() => setShowSignOutConfirm(false)}
                    className="flex-1 px-6 py-3 rounded-full transition-colors"
                    style={{
                      background: 'linear-gradient(to bottom, #2563eb, #1d4ed8)',
                      color: 'white',
                      fontWeight: '600',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transform: 'none'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.background = 'linear-gradient(to bottom, #1d4ed8, #2563eb)';
                      target.style.transform = 'none';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.background = 'linear-gradient(to bottom, #2563eb, #1d4ed8)';
                      target.style.transform = 'none';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex-1 px-6 py-3 rounded-full transition-colors"
                    style={{
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      fontWeight: '600'
                    }}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.background = 'linear-gradient(90deg, #ff4b2b 0%, #ff416c 100%)';
                      target.style.color = 'white';
                      target.style.boxShadow = '0 4px 16px 0 rgba(255,65,108,0.18)';
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.background = '#e5e7eb';
                      target.style.color = '#374151';
                      target.style.boxShadow = 'none';
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
