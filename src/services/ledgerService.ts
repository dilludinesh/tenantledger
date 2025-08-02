
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, orderBy, getDoc } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import { LedgerEntry } from '@/types/ledger';
import { logDataAccess, logDataModification } from '@/utils/securityLogger';
import { sanitizeInput } from '@/utils/validation';
import { isSSR } from '@/utils/environment';

// Centralized function for user ledger path
const getUserLedgerPath = (userId: string) => `artifacts/tenantledgerio/users/${userId}/ledgerEntries`;

export const addEntry = async (entry: Omit<LedgerEntry, 'id'>, userId: string) => {
  // Skip during build time
  if (isSSR()) {
    throw new Error('Cannot add entry during SSR');
  }
  
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
};

// Now requires userId to update correct path
export const updateEntry = async (userId: string, id: string, updates: Partial<LedgerEntry>) => {
  if (isSSR()) {
    throw new Error('Cannot update entry during SSR');
  }
  
  const db = getFirebaseFirestore();
  const entryRef = doc(db, getUserLedgerPath(userId), id);
  await updateDoc(entryRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

// Now requires userId to delete correct path
export const deleteEntry = async (userId: string, id: string) => {
  if (isSSR()) {
    throw new Error('Cannot delete entry during SSR');
  }
  
  const db = getFirebaseFirestore();
  await deleteDoc(doc(db, getUserLedgerPath(userId), id));
};

export const getEntries = async (userId: string) => {
  try {
    // Skip during build time or if Firebase is not properly configured
    if (isSSR() ||
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.includes('dummy') ||
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_api_key_here') {
      return [];
    }

    // Log data access
    logDataAccess('ledger_entries', userId);

    const db = getFirebaseFirestore();
    const userLedgerPath = getUserLedgerPath(userId);
    const q = query(
      collection(db, userLedgerPath),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return [];
    }
    const entries = [];
    for (const docSnap of querySnapshot.docs) {
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
      
      // Normalize data fields to ensure consistent casing with proper typing
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
      
      const entry: LedgerEntry = {
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
      entries.push(entry);
    }
    return entries;
  } catch {
    // Return empty array during build time or if Firebase is not configured
    if (typeof window === 'undefined') {
      return [];
    }
    throw new Error('Failed to fetch entries');
  }
};

// Get a single entry by ID
export const getEntry = async (userId: string, entryId: string) => {
  if (isSSR()) {
    throw new Error('Cannot fetch entry during SSR');
  }
  
  try {
    const db = getFirebaseFirestore();
    const docRef = doc(db, getUserLedgerPath(userId), entryId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Entry not found');
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      date: data.date?.toDate ? data.date.toDate() : new Date(),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    } as LedgerEntry & { id: string };
  } catch (error) {
    if (error instanceof Error && error.message === 'Entry not found') {
      throw error;
    }
    throw new Error('Failed to fetch entry');
  }
};
