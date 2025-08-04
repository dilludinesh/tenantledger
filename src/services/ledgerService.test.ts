import { addEntry, updateEntry, deleteEntry, getEntries, getEntry } from './ledgerService';
import * as firebase from '@/lib/firebase';
import * as environment from '@/utils/environment';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  getFirebaseFirestore: jest.fn(),
  getFirebaseApp: jest.fn()
}));

// Mock environment utility
jest.mock('@/utils/environment', () => ({
  isSSR: jest.fn()
}));

// Mock Firestore functions
const mockCollection = jest.fn();
const mockAddDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockQuery = jest.fn();
const mockDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockOrderBy = jest.fn();
const mockGetDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: (db: unknown, path: string) => mockCollection(db, path),
  addDoc: (collectionRef: unknown, data: unknown) => mockAddDoc(collectionRef, data),
  getDocs: (q: unknown) => mockGetDocs(q),
  query: (collectionRef: unknown, ...constraints: unknown[]) => mockQuery(collectionRef, ...constraints),
  doc: (db: unknown, path: string, id: string) => mockDoc(db, path, id),
  updateDoc: (docRef: unknown, data: unknown) => mockUpdateDoc(docRef, data),
  deleteDoc: (docRef: unknown) => mockDeleteDoc(docRef),
  orderBy: (field: string, direction: unknown) => mockOrderBy(field, direction),
  getDoc: (docRef: unknown) => mockGetDoc(docRef)
}));

describe('ledgerService', () => {
  const mockUserId = 'test-user-id';
  const mockEntryId = 'test-entry-id';
  
  beforeEach(() => {
    jest.clearAllMocks();
    (firebase.getFirebaseFirestore as jest.Mock).mockReturnValue({});
    (environment.isSSR as jest.Mock).mockReturnValue(false);
    
    // Set up default mock returns
    mockAddDoc.mockResolvedValue({ id: 'mock-doc-id' });
    mockUpdateDoc.mockResolvedValue(undefined);
    mockDeleteDoc.mockResolvedValue(undefined);
    mockDoc.mockReturnValue('mock-doc-ref');
    mockCollection.mockReturnValue('mock-collection-ref');
    mockQuery.mockReturnValue('mock-query');
    mockOrderBy.mockReturnValue('mock-order-by');
  });

  describe('addEntry', () => {
    it('should throw error during SSR', async () => {
      (environment.isSSR as jest.Mock).mockReturnValue(true);
      
      await expect(addEntry({} as Parameters<typeof addEntry>[0], mockUserId)).rejects.toThrow('Cannot add entry during SSR');
    });

    it('should add entry with correct data', async () => {
      const mockEntryData = {
        tenant: 'John Doe',
        amount: 1000,
        category: 'Rent' as const,
        description: 'Test entry',
        date: new Date()
      };
      
      const mockDocRef = { id: mockEntryId };
      mockAddDoc.mockResolvedValue(mockDocRef);
      
      const result = await addEntry(mockEntryData, mockUserId);
      
      expect(mockAddDoc).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockEntryId,
        ...mockEntryData,
        userId: mockUserId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('updateEntry', () => {
    it('should throw error during SSR', async () => {
      (environment.isSSR as jest.Mock).mockReturnValue(true);
      
      await expect(updateEntry(mockUserId, mockEntryId, {})).rejects.toThrow('Cannot update entry during SSR');
    });

    it('should update entry with correct data', async () => {
      const mockUpdateData = {
        tenant: 'Jane Doe',
        amount: 1500
      };
      
      await updateEntry(mockUserId, mockEntryId, mockUpdateData);
      
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...mockUpdateData,
          updatedAt: expect.any(Date)
        })
      );
    });
  });

  describe('deleteEntry', () => {
    it('should throw error during SSR', async () => {
      (environment.isSSR as jest.Mock).mockReturnValue(true);
      
      await expect(deleteEntry(mockUserId, mockEntryId)).rejects.toThrow('Cannot delete entry during SSR');
    });

    it('should delete entry', async () => {
      await deleteEntry(mockUserId, mockEntryId);
      
      expect(mockDeleteDoc).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('getEntries', () => {
    it('should return empty array during SSR', async () => {
      (environment.isSSR as jest.Mock).mockReturnValue(true);
      
      const result = await getEntries(mockUserId);
      
      expect(result).toEqual([]);
    });

    it('should return entries when successful', async () => {
      const mockFirestoreData = {
        id: mockEntryId,
        tenant: 'John Doe',
        amount: 1000,
        category: 'Rent',
        description: 'Test entry',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: mockUserId
      };
      
      const mockDocSnapshot = {
        id: mockEntryId,
        data: () => mockFirestoreData,
        exists: () => true
      };
      
      const mockQuerySnapshot = {
        empty: false,
        docs: [mockDocSnapshot]
      };
      
      mockGetDocs.mockResolvedValue(mockQuerySnapshot);
      
      const result = await getEntries(mockUserId);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        id: mockEntryId,
        tenant: 'John Doe',
        amount: 1000,
        category: 'Rent'
        // ... other properties
      }));
    });
  });

  describe('getEntry', () => {
    it('should throw error during SSR', async () => {
      (environment.isSSR as jest.Mock).mockReturnValue(true);
      
      await expect(getEntry(mockUserId, mockEntryId)).rejects.toThrow('Cannot fetch entry during SSR');
    });

    it('should return entry when found', async () => {
      const mockFirestoreData = {
        tenant: 'John Doe',
        amount: 1000,
        category: 'Rent',
        description: 'Test entry',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const mockDocSnapshot = {
        exists: () => true,
        data: () => mockFirestoreData
      };
      
      mockGetDoc.mockResolvedValue(mockDocSnapshot);
      
      const result = await getEntry(mockUserId, mockEntryId);
      
      expect(result).toEqual(expect.objectContaining({
        tenant: 'John Doe',
        amount: 1000,
        category: 'Rent'
        // ... other properties
      }));
    });

    it('should throw error when entry not found', async () => {
      const mockDocSnapshot = {
        exists: () => false
      };
      
      mockGetDoc.mockResolvedValue(mockDocSnapshot);
      
      await expect(getEntry(mockUserId, mockEntryId)).rejects.toThrow('Entry not found');
    });
  });
});