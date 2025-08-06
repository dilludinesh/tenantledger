import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { 
  getEntriesPaginated, 
  addEntry, 
  updateEntry, 
  deleteEntry, 
  deleteMultipleEntries,
  searchEntries 
} from '@/services/ledgerService';
import { LedgerEntry, LedgerFilters } from '@/types/ledger';
import { PaginationParams, PaginatedResponse, LedgerError } from '@/types/api';
import toast from 'react-hot-toast';

// Query keys
export const QUERY_KEYS = {
  entries: (userId: string) => ['entries', userId],
  entriesPaginated: (userId: string, params: PaginationParams) => ['entries', userId, 'paginated', params],
  searchEntries: (userId: string, filters: LedgerFilters, params: PaginationParams) => 
    ['entries', userId, 'search', filters, params],
} as const;

// Hook for fetching paginated entries
export function useLedgerEntries(
  pagination: PaginationParams = {},
  options?: Partial<UseQueryOptions<PaginatedResponse<LedgerEntry & { id: string }>, LedgerError>>
) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.entriesPaginated(user?.uid || '', pagination),
    queryFn: () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return getEntriesPaginated(user.uid, pagination);
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof LedgerError && error.code === 'UNAUTHORIZED') {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
}

// Hook for searching entries
export function useSearchEntries(
  filters: LedgerFilters,
  pagination: PaginationParams = {},
  options?: Partial<UseQueryOptions<PaginatedResponse<LedgerEntry & { id: string }>, LedgerError>>
) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.searchEntries(user?.uid || '', filters, pagination),
    queryFn: () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return searchEntries(user.uid, filters, pagination);
    },
    enabled: !!user?.uid,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    ...options,
  });
}

// Hook for adding entries
export function useAddEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (entry: Omit<LedgerEntry, 'id'>) => {
      if (!user?.uid) throw new Error('User not authenticated');
      return addEntry(entry, user.uid);
    },
    onSuccess: (newEntry) => {
      // Invalidate and refetch entries
      queryClient.invalidateQueries({ 
        queryKey: ['entries', user?.uid] 
      });
      
      // Optimistically add to cache if we have paginated data
      const queryKey = QUERY_KEYS.entriesPaginated(user?.uid || '', {});
      queryClient.setQueryData(queryKey, (old: PaginatedResponse<LedgerEntry & { id: string }> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: [newEntry, ...old.data]
        };
      });
      
      toast.success('Entry added successfully!');
    },
    onError: (error: LedgerError) => {
      toast.error(`Failed to add entry: ${error.message}`);
    },
  });
}

// Hook for updating entries
export function useUpdateEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<LedgerEntry> }) => {
      if (!user?.uid) throw new Error('User not authenticated');
      await updateEntry(user.uid, id, updates);
      return { id, updates };
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['entries', user?.uid] });

      const previousEntries = queryClient.getQueriesData({ queryKey: ['entries', user?.uid] });

      queryClient.setQueriesData(
        { queryKey: ['entries', user?.uid] },
        (old: PaginatedResponse<LedgerEntry & { id: string }> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map(entry => 
              entry.id === id 
                ? { ...entry, ...updates, updatedAt: new Date() }
                : entry
            )
          };
        }
      );

      return { previousEntries };
    },
    onError: (err, variables, context) => {
      if (context?.previousEntries) {
        queryClient.setQueriesData({ queryKey: ['entries', user?.uid] }, context.previousEntries);
      }
      toast.error(`Failed to update entry: ${(err as LedgerError).message}`);
    },
  });
}

// Hook for deleting entries
export function useDeleteEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.uid) throw new Error('User not authenticated');
      await deleteEntry(user.uid, id);
      return id;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['entries', user?.uid] });

      const previousEntries = queryClient.getQueriesData({ queryKey: ['entries', user?.uid] });

      queryClient.setQueriesData(
        { queryKey: ['entries', user?.uid] },
        (old: PaginatedResponse<LedgerEntry & { id: string }> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter(entry => entry.id !== deletedId)
          };
        }
      );

      return { previousEntries };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousEntries) {
        queryClient.setQueriesData({ queryKey: ['entries', user?.uid] }, context.previousEntries);
      }
      toast.error(`Failed to delete entry: ${(err as LedgerError).message}`);
    },
  });
}

// Hook for bulk deleting entries
export function useBulkDeleteEntries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (entryIds: string[]) => {
      if (!user?.uid) throw new Error('User not authenticated');
      await deleteMultipleEntries(user.uid, entryIds);
      return entryIds;
    },
    onSuccess: (deletedIds) => {
      // Invalidate all entry queries
      queryClient.invalidateQueries({ 
        queryKey: ['entries', user?.uid] 
      });
      
      toast.success(`${deletedIds.length} entries deleted successfully!`);
    },
    onError: (error: LedgerError) => {
      toast.error(`Failed to delete entries: ${error.message}`);
    },
  });
}

