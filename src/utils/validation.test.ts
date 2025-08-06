import { validateLedgerEntry, sanitizeInput, formatCurrency } from './validation';

describe('validation utilities', () => {
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

    it('should return isValid false for SQL injection attempt', () => {
      const data = {
        tenant: 'John Doe',
        amount: '1000',
        category: 'Rent',
        description: 'SELECT * FROM users',
        date: '2025-01-01'
      };

      const result = validateLedgerEntry(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('description');
      expect(result.errors.description).toBe('Invalid characters detected in input');
    });

    it('should return isValid false for XSS attempt', () => {
      const data = {
        tenant: '<script>alert("xss")</script>',
        amount: '1000',
        category: 'Rent',
        description: 'Monthly rent payment',
        date: '2025-01-01'
      };

      const result = validateLedgerEntry(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('tenant');
      expect(result.errors.tenant).toBe('Invalid characters detected in input');
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