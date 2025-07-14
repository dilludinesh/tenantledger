
import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LedgerEntry } from '@/types/ledger';

// Centralized function for user ledger path
const getUserLedgerPath = (userId: string) => `artifacts/tenantledgerio/users/${userId}/ledgerEntries`;

export const addEntry = async (entry: Omit<LedgerEntry, 'id'>, userId: string) => {
  const entryWithTimestamp = {
    ...entry,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Use the correct path to the user's ledger entries subcollection
  const userLedgerPath = getUserLedgerPath(userId);
  const docRef = await addDoc(collection(db, userLedgerPath), entryWithTimestamp);
  return { id: docRef.id, ...entryWithTimestamp };
};

// Now requires userId to update correct path
export const updateEntry = async (userId: string, id: string, updates: Partial<LedgerEntry>) => {
  const entryRef = doc(db, getUserLedgerPath(userId), id);
  await updateDoc(entryRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

// Now requires userId to delete correct path
export const deleteEntry = async (userId: string, id: string) => {
  await deleteDoc(doc(db, getUserLedgerPath(userId), id));
};

export const getEntries = async (userId: string) => {
  try {
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
        } catch (error) {
          console.error('Error updating document:', error);
        }
      }
      const entry: LedgerEntry = {
        id: docSnap.id,
        tenant: data.tenant || data.Tenant || 'Unknown',
        amount: data.amount || data.Amount || 0,
        category: data.category || data.Category || 'Other',
        description: data.description || data.Description || '',
        date: data.date?.toDate ? data.date.toDate() : (data.Date?.toDate ? data.Date.toDate() : new Date()),
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.CreatedAt?.toDate ? data.CreatedAt.toDate() : new Date()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.UpdatedAt?.toDate ? data.UpdatedAt.toDate() : new Date()),
        userId: data.userId || userId,
      };
      entries.push(entry);
    }
    return entries;
  } catch (error) {
    console.error('Error fetching entries:', error);
    return [];
  }
};
