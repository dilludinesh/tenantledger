import { processLedgerEntries, calculateSummary } from './ledgerUtils';
import { LedgerEntry } from '@/types/ledger';

describe('ledgerUtils', () => {
  describe('processLedgerEntries', () => {
    it('should process entries correctly', () => {
      const mockEntries: (LedgerEntry & { id: string })[] = [
        {
          id: '1',
          date: new Date('2023-01-01'),
          tenant: 'John Doe',
          amount: 1000,
          category: 'Rent',
          description: 'January rent',
          userId: 'user1'
        },
        {
          id: '2',
          date: new Date('2023-01-02'),
          tenant: 'Jane Smith',
          amount: 500,
          category: 'Maintenance',
          description: 'Plumbing repair',
          userId: 'user1'
        }
      ];

      const result = processLedgerEntries(mockEntries, 'user1');
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({
        id: '1',
        tenant: 'John Doe',
        amount: 1000,
        category: 'Rent'
      }));
      expect(result[1]).toEqual(expect.objectContaining({
        id: '2',
        tenant: 'Jane Smith',
        amount: 500,
        category: 'Maintenance'
      }));
    });

    it('should filter entries by userId', () => {
      const mockEntries: (LedgerEntry & { id: string })[] = [
        {
          id: '1',
          date: new Date('2023-01-01'),
          tenant: 'John Doe',
          amount: 1000,
          category: 'Rent',
          description: 'January rent',
          userId: 'user1'
        },
        {
          id: '2',
          date: new Date('2023-01-02'),
          tenant: 'Jane Smith',
          amount: 500,
          category: 'Maintenance',
          description: 'Plumbing repair',
          userId: 'user2'
        }
      ];

      const result = processLedgerEntries(mockEntries, 'user1');
      
      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user1');
    });
  });

  describe('calculateSummary', () => {
    it('should calculate summary correctly', () => {
      const mockEntries: (LedgerEntry & { id: string })[] = [
        {
          id: '1',
          date: new Date('2023-01-01'),
          tenant: 'John Doe',
          amount: 1000,
          category: 'Rent',
          description: 'January rent',
          userId: 'user1'
        },
        {
          id: '2',
          date: new Date('2023-01-02'),
          tenant: 'Jane Smith',
          amount: 500,
          category: 'Maintenance',
          description: 'Plumbing repair',
          userId: 'user1'
        },
        {
          id: '3',
          date: new Date('2023-01-03'),
          tenant: 'Bob Johnson',
          amount: 2000,
          category: 'Rent',
          description: 'January rent',
          userId: 'user1'
        }
      ];

      const result = calculateSummary(mockEntries);
      
      expect(result).toEqual({
        totalEntries: 3,
        totalAmount: 3500,
        rentTotal: 3000,
        maintenanceTotal: 500,
        securityDepositTotal: 0,
        utilitiesTotal: 0,
        otherTotal: 0,
        uniqueTenants: 3
      });
    });

    it('should handle empty entries', () => {
      const result = calculateSummary([]);
      
      expect(result).toEqual({
        totalEntries: 0,
        totalAmount: 0,
        rentTotal: 0,
        maintenanceTotal: 0,
        securityDepositTotal: 0,
        utilitiesTotal: 0,
        otherTotal: 0,
        uniqueTenants: 0
      });
    });

    it('should handle all category types', () => {
      const mockEntries: (LedgerEntry & { id: string })[] = [
        {
          id: '1',
          date: new Date('2023-01-01'),
          tenant: 'John Doe',
          amount: 1000,
          category: 'Rent',
          description: 'January rent',
          userId: 'user1'
        },
        {
          id: '2',
          date: new Date('2023-01-02'),
          tenant: 'John Doe',
          amount: 200,
          category: 'Maintenance',
          description: 'Repair',
          userId: 'user1'
        },
        {
          id: '3',
          date: new Date('2023-01-03'),
          tenant: 'John Doe',
          amount: 5000,
          category: 'Security Deposit',
          description: 'Deposit',
          userId: 'user1'
        },
        {
          id: '4',
          date: new Date('2023-01-04'),
          tenant: 'John Doe',
          amount: 300,
          category: 'Utilities',
          description: 'Electricity bill',
          userId: 'user1'
        },
        {
          id: '5',
          date: new Date('2023-01-05'),
          tenant: 'John Doe',
          amount: 150,
          category: 'Other',
          description: 'Other expense',
          userId: 'user1'
        }
      ];

      const result = calculateSummary(mockEntries);
      
      expect(result).toEqual({
        totalEntries: 5,
        totalAmount: 6650,
        rentTotal: 1000,
        maintenanceTotal: 200,
        securityDepositTotal: 5000,
        utilitiesTotal: 300,
        otherTotal: 150,
        uniqueTenants: 1
      });
    });
  });
});