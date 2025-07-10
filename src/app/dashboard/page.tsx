"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Firebase auth is now handled by AuthContext
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getEntries, addEntry } from '@/services/ledgerService';
// LedgerEntry type is defined locally
import { EntryForm } from './components/EntryForm/EntryForm';
import { EntriesTable } from './components/EntriesTable/EntriesTable';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import styles from './glass.module.css';

// User type is available from AuthContext

// Create a client
const queryClient = new QueryClient();

function DashboardContent() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Update the LedgerEntry type to make the id field required
  type LedgerEntry = {
    id: string;
    tenant: string;
    amount: number;
    category: string;
    description: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
  };

  // State managed by React Query

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
      // Ensure each entry has an id and proper types
      return ledgerEntries
        .filter((entry): entry is LedgerEntry & { id: string } => {
          if (!entry.id) {
            console.warn('Entry is missing required id, skipping:', entry);
            return false;
          }
          return true;
        })
        .map(entry => ({
          ...entry,
          userId: entry.userId || user.uid,
          createdAt: entry.createdAt || new Date(),
          updatedAt: entry.updatedAt || new Date(),
        }));
    },
    enabled: !!user,
  });

  // Add entry mutation
  const addEntryMutation = useMutation({
    mutationFn: async (data: {
      tenant: string;
      amount: string;
      category: string;
      description: string;
      date: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const entryToAdd: Omit<LedgerEntry, 'id'> = {
        tenant: data.tenant,
        amount: Number(data.amount) || 0,
        category: data.category,
        description: data.description,
        date: new Date(data.date),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.uid
      };
      
      await addEntry(entryToAdd, user.uid);
      return; // Explicitly return void
    },
    onSuccess: () => {
      // Invalidate and refetch entries after successful addition
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
  });

  if (loading || isFetching || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2">
                {user && (
                  <div className={`${styles.glassCard} text-sm`}>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-xs text-gray-400 dark:text-gray-500">Welcome,</span>
                      <span className="text-[15px] font-semibold text-gray-900 dark:text-white">
                        {user.displayName || user.email?.split('@')[0] || 'User'}
                      </span>
                    </div>
                    <div className="space-y-1 mt-1.5">
                      {user.email && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[240px]">
                          {user.email}
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="text-[11px] font-mono text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded">
                          <span className="text-gray-400 dark:text-gray-500">UID:</span>{' '}
                          <span className="text-gray-600 dark:text-gray-200 font-medium">{user.uid}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className={`${styles.glassButton} flex items-center space-x-2 group`}
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
              <h1 
                className="text-3xl md:text-4xl font-bold mt-2"
                style={{
                  background: 'linear-gradient(90deg, #3b82f6, rgb(167, 41, 240))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  textShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                Tenant Ledger
              </h1>
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entry Form */}
          <div className="lg:col-span-1">
            <div className={styles.glassCard}>
              <EntryForm 
                onSubmit={async (data) => {
                  await addEntryMutation.mutateAsync(data);
                }}
                isLoading={addEntryMutation.isPending}
              />
            </div>
          </div>
          
          {/* Entries Table */}
          <div className="lg:col-span-2">
            <div className={styles.glassCard}>
              <EntriesTable 
                entries={entries} 
                isLoading={isFetching} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <QueryClientProvider client={queryClient}>
        <DashboardContent />
      </QueryClientProvider>
    </div>
  );
}