import { validateEntryForm, EntryFormData } from '../validation';

describe('validateEntryForm', () => {
  it('should return no errors for valid data', () => {
    const validData: EntryFormData = {
      tenant: 'John Doe',
      amount: '1000',
      category: 'Rent',
      description: 'Monthly rent',
      date: '2025-07-23',
    };
    const errors = validateEntryForm(validData);
    expect(errors).toHaveLength(0);
  });

  it('should validate required fields', () => {
    const invalidData: EntryFormData = {
      tenant: '',
      amount: '',
      category: '',
      description: '',
      date: '',
    };
    const errors = validateEntryForm(invalidData);
    expect(errors.some(e => e.field === 'tenant')).toBe(true);
    expect(errors.some(e => e.field === 'amount')).toBe(true);
    expect(errors.some(e => e.field === 'category')).toBe(true);
    expect(errors.some(e => e.field === 'date')).toBe(true);
  });

  it('should validate tenant name length', () => {
    const data: EntryFormData = {
      tenant: 'A',
      amount: '100',
      category: 'Rent',
      description: '',
      date: '2025-07-23',
    };
    const errors = validateEntryForm(data);
    expect(errors.some(e => e.field === 'tenant')).toBe(true);
  });

  it('should validate amount is a number and positive', () => {
    const data: EntryFormData = {
      tenant: 'John',
      amount: '-50',
      category: 'Rent',
      description: '',
      date: '2025-07-23',
    };
    const errors = validateEntryForm(data);
    expect(errors.some(e => e.field === 'amount')).toBe(true);
  });

  it('should validate category is valid', () => {
    const data: EntryFormData = {
      tenant: 'John',
      amount: '100',
      category: 'InvalidCategory',
      description: '',
      date: '2025-07-23',
    };
    const errors = validateEntryForm(data);
    expect(errors.some(e => e.field === 'category')).toBe(true);
  });

  it('should validate description length', () => {
    const data: EntryFormData = {
      tenant: 'John',
      amount: '100',
      category: 'Rent',
      description: 'a'.repeat(501),
      date: '2025-07-23',
    };
    const errors = validateEntryForm(data);
    expect(errors.some(e => e.field === 'description')).toBe(true);
  });

  it('should validate date is present', () => {
    const data: EntryFormData = {
      tenant: 'John',
      amount: '100',
      category: 'Rent',
      description: '',
      date: '',
    };
    const errors = validateEntryForm(data);
    expect(errors.some(e => e.field === 'date')).toBe(true);
  });
});
