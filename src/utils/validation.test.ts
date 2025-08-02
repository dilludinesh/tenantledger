import { validateEntryForm, validateLedgerEntry, sanitizeInput, formatCurrency } from './validation';

describe('validation utilities', () => {
  describe('validateEntryForm', () => {
    it('should validate a correct form', () => {
      const data = {
        tenant: 'John Doe',
        amount: '1000',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: '2025-01-01'
      };

      const errors = validateEntryForm(data);
      expect(errors).toHaveLength(0);
    });

    it('should require tenant name', () => {
      const data = {
        tenant: '',
        amount: '1000',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: '2025-01-01'
      };

      const errors = validateEntryForm(data);
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'tenant', message: 'Tenant name is required' })
        ])
      );
    });

    it('should validate tenant name length', () => {
      // Too short
      const data1 = {
        tenant: 'A',
        amount: '1000',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: '2025-01-01'
      };

      const errors1 = validateEntryForm(data1);
      expect(errors1).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'tenant', message: 'Tenant name must be at least 2 characters' })
        ])
      );

      // Too long
      const data2 = {
        tenant: 'A'.repeat(101),
        amount: '1000',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: '2025-01-01'
      };

      const errors2 = validateEntryForm(data2);
      expect(errors2).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'tenant', message: 'Tenant name must be less than 100 characters' })
        ])
      );
    });

    it('should validate amount', () => {
      // Required
      const data1 = {
        tenant: 'John Doe',
        amount: '',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: '2025-01-01'
      };

      const errors1 = validateEntryForm(data1);
      expect(errors1).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'amount', message: 'Amount is required' })
        ])
      );

      // Must be a number
      const data2 = {
        tenant: 'John Doe',
        amount: 'abc',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: '2025-01-01'
      };

      const errors2 = validateEntryForm(data2);
      expect(errors2).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'amount', message: 'Amount must be a valid number' })
        ])
      );

      // Must be positive
      const data3 = {
        tenant: 'John Doe',
        amount: '-100',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: '2025-01-01'
      };

      const errors3 = validateEntryForm(data3);
      expect(errors3).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'amount', message: 'Amount must be greater than 0' })
        ])
      );

      // Too large
      const data4 = {
        tenant: 'John Doe',
        amount: '10000001',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: '2025-01-01'
      };

      const errors4 = validateEntryForm(data4);
      expect(errors4).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'amount', message: 'Amount must be less than ₹1,00,00,000' })
        ])
      );
    });

    it('should validate category', () => {
      // Required
      const data1 = {
        tenant: 'John Doe',
        amount: '1000',
        category: '',
        description: 'Monthly rent payment',
        date: '2025-01-01'
      };

      const errors1 = validateEntryForm(data1);
      expect(errors1).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'category', message: 'Category is required' })
        ])
      );

      // Invalid category
      const data2 = {
        tenant: 'John Doe',
        amount: '1000',
        category: 'Invalid',
        description: 'Monthly rent payment',
        date: '2025-01-01'
      };

      const errors2 = validateEntryForm(data2);
      expect(errors2).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'category', message: 'Invalid category selected' })
        ])
      );
    });

    it('should validate description length', () => {
      const data = {
        tenant: 'John Doe',
        amount: '1000',
        category: 'Rent',
        description: 'A'.repeat(501),
        date: '2025-01-01'
      };

      const errors = validateEntryForm(data);
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'description', message: 'Description must be less than 500 characters' })
        ])
      );
    });

    it('should validate date', () => {
      // Required
      const data1 = {
        tenant: 'John Doe',
        amount: '1000',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: ''
      };

      const errors1 = validateEntryForm(data1);
      expect(errors1).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'date', message: 'Date is required' })
        ])
      );

      // Invalid format
      const data2 = {
        tenant: 'John Doe',
        amount: '1000',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: 'invalid-date'
      };

      const errors2 = validateEntryForm(data2);
      expect(errors2).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'date', message: 'Invalid date format' })
        ])
      );

      // Too old
      const data3 = {
        tenant: 'John Doe',
        amount: '1000',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: '2023-01-01'
      };

      const errors3 = validateEntryForm(data3);
      expect(errors3).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'date', message: 'Date cannot be more than 1 year ago' })
        ])
      );

      // Too far in future
      const data4 = {
        tenant: 'John Doe',
        amount: '1000',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: '2027-01-01'
      };

      const errors4 = validateEntryForm(data4);
      expect(errors4).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'date', message: 'Date cannot be more than 1 year in the future' })
        ])
      );
    });
  });

  describe('validateLedgerEntry', () => {
    it('should return isValid true for valid data', () => {
      const data = {
        tenant: 'John Doe',
        amount: '1000',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: '2025-01-01'
      };

      const result = validateLedgerEntry(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return isValid false for invalid data', () => {
      const data = {
        tenant: '',
        amount: '1000',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: '2025-01-01'
      };

      const result = validateLedgerEntry(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('tenant');
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });

    it('should remove angle brackets', () => {
      expect(sanitizeInput('<script>alert("test")</script>')).toBe('scriptalert("test")/script');
    });
  });

  describe('formatCurrency', () => {
    it('should format number as INR currency', () => {
      expect(formatCurrency(1000)).toBe('₹1,000.00');
      expect(formatCurrency(100000)).toBe('₹1,00,000.00');
    });
  });
});