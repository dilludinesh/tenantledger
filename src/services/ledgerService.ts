import { collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LedgerEntry } from '@/types/ledger';

const LEDGER_COLLECTION = 'artifacts';

export const addEntry = async (entry: Omit<LedgerEntry, 'id'>, userId: string) => {
  const entryWithTimestamp = {
    ...entry,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  // Use the correct path to the user's ledger entries subcollection
  const userLedgerPath = `artifacts/tenantledgerio/users/${userId}/ledgerEntries`;
  const docRef = await addDoc(collection(db, userLedgerPath), entryWithTimestamp);
  return { id: docRef.id, ...entryWithTimestamp };
};

export const updateEntry = async (id: string, updates: Partial<LedgerEntry>) => {
  const entryRef = doc(db, LEDGER_COLLECTION, id);
  await updateDoc(entryRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const deleteEntry = async (id: string) => {
  await deleteDoc(doc(db, LEDGER_COLLECTION, id));
};

export const getEntries = async (userId: string) => {
  try {
    // Construct the correct path to the user's ledger entries subcollection
    const userLedgerPath = `artifacts/tenantledgerio/users/${userId}/ledgerEntries`;
    
    const q = query(
      collection(db, userLedgerPath),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return [];
    }
    
    const entries = [];
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      
      // Skip entries that belong to other users
      if (data.userId && data.userId !== userId) {
        continue;
      }
      
      // If this is an old entry without userId, update it
      if (!data.userId) {
        try {
          await updateDoc(doc.ref, { userId });
          data.userId = userId;
        } catch (error) {
          console.error('Error updating document:', error);
        }
      }
      
      // Map document data to LedgerEntry
      const entry: LedgerEntry = {
        id: doc.id,
        tenant: data.tenant || data.Tenant || 'Unknown',
        amount: data.amount || data.Amount || 0,
        category: data.category || data.Category || 'Other',
        description: data.description || data.Description || '',
        date: data.date?.toDate() || data.Date?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || data.CreatedAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || data.UpdatedAt?.toDate() || new Date(),
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
