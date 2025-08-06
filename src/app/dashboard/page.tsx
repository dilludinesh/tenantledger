"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEntries, addEntry, updateEntry } from '@/services/ledgerService';
import { LedgerEntry, LedgerCategory } from '@/types/ledger';
import { EntryForm } from './components/EntryForm/EntryForm';
import { EntriesTable } from './components/EntriesTable/EntriesTable';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import DashboardHeader from './components/DashboardHeader';
import { HelpModal } from '@/components/HelpModal';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { processLedgerEntries } from '@/utils/ledgerUtils';
import { exportToCSV } from '@/utils/export';
import { useKeyboardShortcuts, createCommonShortcuts } from '@/hooks/useKeyboardShortcuts';
import { filterEntries, FilterOptions } from '@/utils/filterUtils';
import { SignOutModal } from '@/components/SignOutModal';
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
  const entryFormRef = useRef<HTMLFormElement>(null);

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
      entryFormRef.current?.querySelector<HTMLInputElement>('input[name="tenant"]')?.focus();
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
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader
          currentUser={user}
          demoUser={false}
          setShowSignOutConfirm={setShowSignOutConfirm}
          onExportCSV={handleExportCSV}
          filteredEntriesCount={filteredEntries.length}
          totalEntriesCount={entries.length}
          tenants={uniqueTenants}
          onFilterChange={handleFilterChange}
        >
          <EntryForm
            ref={entryFormRef}
            onSubmit={(values) => mutation.mutate({ values, entryId: editingEntry?.id })}
            isLoading={mutation.isPending}
            entryToEdit={editingEntry}
            onCancelEdit={() => setEditingEntry(null)}
            onPrintLedger={() => window.print()}
          />
        </DashboardHeader>

        




        <div className="grid grid-cols-1 gap-8">
          {/* Entries Table */}
          <div className="lg:col-span-2">
            <div className={styles.glassCard} style={{borderRadius: 20, boxShadow: '0 2px 16px 0 rgba(31,38,135,0.10)'}}>
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
          isOpen={showHelp && !showSignOutConfirm}
          onClose={() => setShowHelp(false)}
        />

        <SignOutModal
          isOpen={showSignOutConfirm}
          onClose={() => setShowSignOutConfirm(false)}
          onConfirm={handleSignOut}
        />
      </div>
    </div>
  </div>
  );
}