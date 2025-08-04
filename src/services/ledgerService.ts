
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  getDoc,
  limit,
  startAfter,
  where,
  Timestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { LedgerEntry, LedgerFilters } from '@/types/ledger';
import { PaginationParams, PaginatedResponse, handleFirebaseError, createLedgerError, ERROR_CODES } from '@/types/api';
import { logDataAccess, logDataModification } from '@/utils/securityLogger';
import { sanitizeInput } from '@/utils/validation';
import { isSSR } from '@/utils/environment';

// Centralized function for user ledger path
const getUserLedgerPath = (userId: string) => `artifacts/tenantledgerio/users/${userId}/ledgerEntries`;

export const addEntry = async (entry: Omit<LedgerEntry, 'id'>, userId: string): Promise<LedgerEntry & { id: string }> => {
  if (isSSR()) {
    throw createLedgerError(ERROR_CODES.SERVER_ERROR, 'Cannot add entry during SSR');
  }
  
  if (!userId) {
    throw createLedgerError(ERROR_CODES.UNAUTHORIZED, 'User ID is required');
  }
  
  try {
    // Sanitize input data
    const sanitizedEntry = {
      ...entry,
      tenant: sanitizeInput(entry.tenant || ''),
      description: sanitizeInput(entry.description || ''),
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const db = getFirebaseFirestore();
    const userLedgerPath = getUserLedgerPath(userId);
    const docRef = await addDoc(collection(db, userLedgerPath), sanitizedEntry);
    
    // Log security event
    logDataModification('ledger_entry', 'create', userId);
    
    return { id: docRef.id, ...sanitizedEntry };
  } catch (error) {
    throw handleFirebaseError(error);
  }
};

export const updateEntry = async (userId: string, id: string, updates: Partial<LedgerEntry>): Promise<void> => {
  if (isSSR()) {
    throw createLedgerError(ERROR_CODES.SERVER_ERROR, 'Cannot update entry during SSR');
  }
  
  if (!userId || !id) {
    throw createLedgerError(ERROR_CODES.INVALID_INPUT, 'User ID and entry ID are required');
  }
  
  try {
    const db = getFirebaseFirestore();
    const entryRef = doc(db, getUserLedgerPath(userId), id);
    
    // Sanitize string fields if they exist in updates
    const sanitizedUpdates = { ...updates };
    if (sanitizedUpdates.tenant) {
      sanitizedUpdates.tenant = sanitizeInput(sanitizedUpdates.tenant);
    }
    if (sanitizedUpdates.description) {
      sanitizedUpdates.description = sanitizeInput(sanitizedUpdates.description);
    }
    
    await updateDoc(entryRef, {
      ...sanitizedUpdates,
      updatedAt: new Date(),
    });
    
    logDataModification('ledger_entry', 'update', userId);
  } catch (error) {
    throw handleFirebaseError(error);
  }
};

export const deleteEntry = async (userId: string, id: string): Promise<void> => {
  if (isSSR()) {
    throw createLedgerError(ERROR_CODES.SERVER_ERROR, 'Cannot delete entry during SSR');
  }
  
  if (!userId || !id) {
    throw createLedgerError(ERROR_CODES.INVALID_INPUT, 'User ID and entry ID are required');
  }
  
  try {
    const db = getFirebaseFirestore();
    await deleteDoc(doc(db, getUserLedgerPath(userId), id));
    
    logDataModification('ledger_entry', 'delete', userId);
  } catch (error) {
    throw handleFirebaseError(error);
  }
};

// Bulk delete entries
export const deleteMultipleEntries = async (userId: string, entryIds: string[]): Promise<void> => {
  if (isSSR()) {
    throw createLedgerError(ERROR_CODES.SERVER_ERROR, 'Cannot delete entries during SSR');
  }
  
  if (!userId || !entryIds.length) {
    throw createLedgerError(ERROR_CODES.INVALID_INPUT, 'User ID and entry IDs are required');
  }
  
  try {
    const db = getFirebaseFirestore();
    const deletePromises = entryIds.map(id => 
      deleteDoc(doc(db, getUserLedgerPath(userId), id))
    );
    
    await Promise.all(deletePromises);
    
    logDataModification('ledger_entry', 'bulk_delete', userId, { count: entryIds.length });
  } catch (error) {
    throw handleFirebaseError(error);
  }
};

// Legacy function for backward compatibility - now uses pagination internally
export const getEntries = async (userId: string): Promise<Array<LedgerEntry & { id: string }>> => {
  const result = await getEntriesPaginated(userId, { limit: 1000 });
  return result.data;
};

// New paginated function
export const getEntriesPaginated = async (
  userId: string, 
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<LedgerEntry & { id: string }>> => {
  try {
    // Skip during build time or if Firebase is not properly configured
    if (isSSR() ||
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('dummy') ||
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_api_key_here') {
      return { data: [], hasMore: false };
    }

    if (!userId) {
      throw createLedgerError(ERROR_CODES.UNAUTHORIZED, 'User ID is required');
    }

    // Log data access
    logDataAccess('ledger_entries', userId);

    const db = getFirebaseFirestore();
    const userLedgerPath = getUserLedgerPath(userId);
    
    const {
      limit: pageLimit = 50,
      cursor,
      orderBy: orderField = 'date',
      orderDirection = 'desc'
    } = pagination;

    // Build query
    let q = query(
      collection(db, userLedgerPath),
      orderBy(orderField, orderDirection),
      limit(pageLimit + 1) // Get one extra to check if there are more
    );

    // Add cursor for pagination
    if (cursor) {
      const cursorDoc = await getDoc(doc(db, userLedgerPath, cursor));
      if (cursorDoc.exists()) {
        q = query(
          collection(db, userLedgerPath),
          orderBy(orderField, orderDirection),
          startAfter(cursorDoc),
          limit(pageLimit + 1)
        );
      }
    }

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { data: [], hasMore: false };
    }

    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageLimit;
    const entries = docs.slice(0, pageLimit); // Remove the extra document

    const processedEntries: Array<LedgerEntry & { id: string }> = [];
    
    for (const docSnap of entries) {
      const data = docSnap.data();
      
      // Skip entries that belong to other users
      if (data.userId && data.userId !== userId) {
        continue;
      }
      
      // If this is an old entry without userId, update it
      if (!data.userId) {
        try {
          await updateDoc(docSnap.ref, { userId: userId });
          data.userId = userId;
        } catch {
          // Silent error handling for document update
        }
      }
      
      const entry = normalizeEntryData(docSnap, data, userId);
      processedEntries.push(entry);
    }

    const nextCursor = hasMore && processedEntries.length > 0 
      ? processedEntries[processedEntries.length - 1].id 
      : undefined;

    return {
      data: processedEntries,
      nextCursor,
      hasMore
    };
  } catch (error) {
    // Return empty array during build time or if Firebase is not configured
    if (typeof window === 'undefined') {
      return { data: [], hasMore: false };
    }
    throw handleFirebaseError(error);
  }
};

// Helper function to normalize entry data
function normalizeEntryData(docSnap: DocumentSnapshot, data: any, userId: string): LedgerEntry & { id: string } {
  const normalizeStringField = (primary: unknown, fallback: unknown, defaultValue: string): string => {
    if (typeof primary === 'string') return primary;
    if (typeof fallback === 'string') return fallback;
    return defaultValue;
  };
  
  const normalizeNumberField = (primary: unknown, fallback: unknown, defaultValue: number): number => {
    if (typeof primary === 'number') return primary;
    if (typeof fallback === 'number') return fallback;
    return defaultValue;
  };
  
  return {
    id: docSnap.id,
    tenant: normalizeStringField(data.tenant, data.Tenant, 'Unknown'),
    amount: normalizeNumberField(data.amount, data.Amount, 0),
    category: normalizeStringField(data.category, data.Category, 'Other'),
    description: normalizeStringField(data.description, data.Description, ''),
    date: data.date?.toDate ? data.date.toDate() : (data.Date?.toDate ? data.Date.toDate() : new Date()),
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.CreatedAt?.toDate ? data.CreatedAt.toDate() : new Date()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.UpdatedAt?.toDate ? data.UpdatedAt.toDate() : new Date()),
    userId: data.userId || userId,
  };
}

// Get a single entry by ID
export const getEntry = async (userId: string, entryId: string): Promise<LedgerEntry & { id: string }> => {
  if (isSSR()) {
    throw createLedgerError(ERROR_CODES.SERVER_ERROR, 'Cannot fetch entry during SSR');
  }
  
  if (!userId || !entryId) {
    throw createLedgerError(ERROR_CODES.INVALID_INPUT, 'User ID and entry ID are required');
  }
  
  try {
    const db = getFirebaseFirestore();
    const docRef = doc(db, getUserLedgerPath(userId), entryId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw createLedgerError(ERROR_CODES.NOT_FOUND, 'Entry not found');
    }
    
    const data = docSnap.data();
    return normalizeEntryData(docSnap, data, userId);
  } catch (error) {
    if (error instanceof LedgerError) {
      throw error;
    }
    throw handleFirebaseError(error);
  }
};

// Search entries with filters
export const searchEntries = async (
  userId: string,
  filters: LedgerFilters,
  pagination: PaginationParams = {}
): Promise<PaginatedResponse<LedgerEntry & { id: string }>> => {
  if (isSSR()) {
    throw createLedgerError(ERROR_CODES.SERVER_ERROR, 'Cannot search entries during SSR');
  }
  
  if (!userId) {
    throw createLedgerError(ERROR_CODES.UNAUTHORIZED, 'User ID is required');
  }
  
  try {
    const db = getFirebaseFirestore();
    const userLedgerPath = getUserLedgerPath(userId);
    
    const {
      limit: pageLimit = 50,
      cursor,
      orderBy: orderField = 'date',
      orderDirection = 'desc'
    } = pagination;

    // Build base query
    let q = query(collection(db, userLedgerPath));

    // Add filters
    if (filters.dateFrom) {
      q = query(q, where('date', '>=', Timestamp.fromDate(new Date(filters.dateFrom))));
    }
    
    if (filters.dateTo) {
      q = query(q, where('date', '<=', Timestamp.fromDate(new Date(filters.dateTo))));
    }
    
    if (filters.tenant) {
      q = query(q, where('tenant', '==', filters.tenant));
    }
    
    if (filters.categories.length > 0) {
      q = query(q, where('category', 'in', filters.categories));
    }

    // Add ordering and pagination
    q = query(q, orderBy(orderField, orderDirection), limit(pageLimit + 1));

    if (cursor) {
      const cursorDoc = await getDoc(doc(db, userLedgerPath, cursor));
      if (cursorDoc.exists()) {
        q = query(q, startAfter(cursorDoc));
      }
    }

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { data: [], hasMore: false };
    }

    const docs = querySnapshot.docs;
    const hasMore = docs.length > pageLimit;
    const entries = docs.slice(0, pageLimit);

    const processedEntries: Array<LedgerEntry & { id: string }> = [];
    
    for (const docSnap of entries) {
      const data = docSnap.data();
      const entry = normalizeEntryData(docSnap, data, userId);
      
      // Apply client-side filters that can't be done in Firestore
      if (filters.amountMin !== undefined && entry.amount < filters.amountMin) continue;
      if (filters.amountMax !== undefined && entry.amount > filters.amountMax) continue;
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesDescription = entry.description.toLowerCase().includes(searchLower);
        const matchesTenant = entry.tenant.toLowerCase().includes(searchLower);
        if (!matchesDescription && !matchesTenant) continue;
      }
      
      processedEntries.push(entry);
    }

    const nextCursor = hasMore && processedEntries.length > 0 
      ? processedEntries[processedEntries.length - 1].id 
      : undefined;

    logDataAccess('ledger_search', userId, { filters, resultCount: processedEntries.length });

    return {
      data: processedEntries,
      nextCursor,
      hasMore
    };
  } catch (error) {
    throw handleFirebaseError(error);
  }
};
