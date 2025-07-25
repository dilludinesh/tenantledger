"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEntries, addEntry, updateEntry } from '@/services/ledgerService';
import { LedgerEntry } from '@/types/ledger';
import { EntryForm } from './components/EntryForm/EntryForm';
import { EntriesTable } from './components/EntriesTable/EntriesTable';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { processLedgerEntries } from '@/utils/ledgerUtils';
import styles from './glass.module.css';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry & { id: string } | null>(null);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    console.log('Dashboard auth check:', { user, loading });
    if (!loading && !user) {
      console.log('Redirecting to login');
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
        category: values.category,
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

  if (loading || isFetching || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          {/* Title Section */}
          <div className="text-center mb-10">
            <h1 
              className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight title-gradient"
              aria-label="Tenant Ledger Dashboard"
            >
              <span style={{letterSpacing: '0.01em'}}>Tenant Ledger</span>
            </h1>
          </div>

          {/* User Info and Sign Out Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10 w-full">
            {/* Welcome/User Info left */}
            <div className="flex flex-col w-full sm:w-auto">
              {user && (
                <div className={`${styles.glassCard} text-base w-full sm:w-auto shadow-lg`} style={{borderRadius: 24}}>
                  <div className="flex flex-col gap-2 p-4">
                    <span className="text-xs text-gray-400">Welcome</span>
                    <span 
                      className="text-lg font-semibold"
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
                      <span className="text-gray-500 text-xs truncate max-w-[200px] sm:max-w-[180px]">
                        {user.email}
                      </span>
                    )}
                    <span 
                      className="font-mono text-xs break-all"
                      style={{
                        background: 'linear-gradient(90deg, #3b82f6, rgb(167, 41, 240))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                    >
                      <span className="text-gray-400">UID: </span>
                      <span className="font-medium">{user.uid}</span>
                    </span>
                  </div>
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
              {showSignOutConfirm && (
                <div className="mt-3 flex flex-row gap-3">
                  <button
                    onClick={handleSignOut}
                    className="btn-signout px-6 py-2 text-base font-bold shadow-md"
                    aria-label="Confirm sign out"
                  >
                    Confirm Sign Out
                  </button>
                  <button
                    onClick={() => setShowSignOutConfirm(false)}
                    className="btn btn-outline"
                    aria-label="Cancel sign out"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

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
                entries={entries}
                isLoading={isFetching}
                onEdit={handleEdit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
