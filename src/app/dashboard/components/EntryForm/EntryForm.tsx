import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { format } from 'date-fns';
import { CATEGORIES, LedgerEntry } from '@/types/ledger';
import { validateLedgerEntry, sanitizeInput } from '@/utils/validation';
import styles from './EntryForm.module.css';

interface EntryFormProps {
  onSubmit: (data: {
    tenant: string;
    amount: string;
    category: string;
    description: string;
    date: string;
  }) => void;
  isLoading?: boolean;
  entryToEdit?: (LedgerEntry & { id: string }) | null;
  onCancelEdit?: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  onSubmit,
  isLoading = false,
  entryToEdit,
  onCancelEdit,
}) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    tenant: '',
    amount: '',
    category: 'Rent',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (entryToEdit) {
      setFormData({
        date: format(new Date(entryToEdit.date), 'yyyy-MM-dd'),
        tenant: entryToEdit.tenant,
        amount: entryToEdit.amount.toString(),
        category: entryToEdit.category,
        description: entryToEdit.description,
      });
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        tenant: '',
        amount: '',
        category: 'Rent',
        description: '',
      });
    }
  }, [entryToEdit]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Sanitize input for security
    const sanitizedValue = name === 'amount' ? value : sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validateLedgerEntry(formData);
    setErrors(validation.errors);
    
    if (!validation.isValid) {
      // Focus on the first field with an error
      const firstErrorField = Object.keys(validation.errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
        element?.focus();
      }
      return;
    }
    onSubmit(formData);
  };

  const handleReset = () => {
    if (entryToEdit && onCancelEdit) {
      onCancelEdit();
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        tenant: '',
        amount: '',
        category: 'Rent',
        description: '',
      });
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-1 h-full">
      <div className="flex flex-col justify-between h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
          {/* Column 1: Date and Amount */}
          <div className="space-y-2">
            <div>
              <label htmlFor="date" className={styles.label}>
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`${styles.formInput} ${errors.date ? styles.errorInput : ''}`}
              />
              {errors.date && <p className={styles.errorMessage}>{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="amount" className={styles.label}>
                Amount (₹)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`${styles.formInput} ${errors.amount ? styles.errorInput : ''}`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.amount && <p className={styles.errorMessage}>{errors.amount}</p>}
            </div>
          </div>

          {/* Column 2: Tenant and Category */}
          <div className="space-y-2">
            <div>
              <label htmlFor="tenant" className={styles.label}>
                Tenant
              </label>
              <input
                type="text"
                id="tenant"
                name="tenant"
                value={formData.tenant}
                onChange={handleChange}
                className={`${styles.formInput} ${errors.tenant ? styles.errorInput : ''}`}
                placeholder="Tenant name"
              />
              {errors.tenant && <p className={styles.errorMessage}>{errors.tenant}</p>}
            </div>

            <div>
              <label htmlFor="category" className={styles.label}>
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`${styles.formInput} ${errors.category ? styles.errorInput : ''}`}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className={styles.errorMessage}>{errors.category}</p>}
            </div>
          </div>

          {/* Column 3: Description and Buttons */}
          <div className="space-y-2">
            <div>
              <label htmlFor="description" className={styles.label}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`${styles.formInput} ${errors.description ? styles.errorInput : ''}`}
                placeholder="Payment details"
                rows={1}
              />
              {errors.description && <p className={styles.errorMessage}>{errors.description}</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 py-3 px-6 rounded-full font-semibold transition-all ${styles.buttonPrimary}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {entryToEdit ? 'Updating...' : 'Adding...'}
                  </span>
                ) : entryToEdit ? (
                  'Update Entry'
                ) : (
                  'Add Entry'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className={`py-3 px-6 rounded-full font-semibold transition-all ${styles.buttonSecondary}`}
              >
                {entryToEdit ? 'Cancel' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
