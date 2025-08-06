import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
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
  onPrintLedger?: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({
  onSubmit,
  isLoading = false,
  entryToEdit,
  onCancelEdit,
  onPrintLedger,
}) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    tenant: '',
    amount: '',
    category: 'Rent',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

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
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
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
      const firstErrorField = Object.keys(validation.errors)[0];
      if (firstErrorField && formRef.current) {
        const element = formRef.current.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
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
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} ref={formRef}>
      <div className="space-y-4">
        {/* Balanced 2-column layout */}
        <div className="max-w-lg space-y-4">
          {/* Row 1: Date and Tenant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="date" className={`${styles.label} text-xs`}>
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`${styles.formInput} h-10 text-sm w-full ${errors.date ? styles.errorInput : ''}`}
              />
              {errors.date && <p className={`${styles.errorMessage} text-xs`}>{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="tenant" className={`${styles.label} text-xs`}>
                Tenant
              </label>
              <input
                type="text"
                id="tenant"
                name="tenant"
                value={formData.tenant}
                onChange={handleChange}
                className={`${styles.formInput} h-10 text-sm w-full ${errors.tenant ? styles.errorInput : ''}`}
                placeholder="Tenant name"
                autoFocus
              />
              {errors.tenant && <p className={`${styles.errorMessage} text-xs`}>{errors.tenant}</p>}
            </div>
          </div>

          {/* Row 2: Amount and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="amount" className={`${styles.label} text-xs`}>
                Amount (₹)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`${styles.formInput} h-10 text-sm w-full ${errors.amount ? styles.errorInput : ''}`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.amount && <p className={`${styles.errorMessage} text-xs`}>{errors.amount}</p>}
            </div>

            <div>
              <label htmlFor="category" className={`${styles.label} text-xs`}>
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`${styles.formInput} h-10 text-sm w-full ${errors.category ? styles.errorInput : ''}`}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className={`${styles.errorMessage} text-xs`}>{errors.category}</p>}
            </div>
          </div>

          {/* Row 3: Description - Full width */}
          <div>
            <label htmlFor="description" className={`${styles.label} text-xs`}>
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${styles.formInput} h-10 text-sm w-full ${errors.description ? styles.errorInput : ''}`}
              placeholder="Payment details"
            />
            {errors.description && <p className={`${styles.errorMessage} text-xs`}>{errors.description}</p>}
          </div>
        </div>

        {/* Action buttons - balanced layout */}
        <div className="flex items-center justify-start gap-3 pt-3 max-w-lg">
          <button
            type="submit"
            disabled={isLoading}
            className={styles.buttonPrimary}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {entryToEdit ? 'Updating...' : 'Adding...'}
              </span>
            ) : entryToEdit ? (
              'Update'
            ) : (
              'Add Entry'
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className={styles.buttonSecondary}
          >
            {entryToEdit ? 'Cancel' : 'Reset'}
          </button>

          {onPrintLedger && (
            <button
              type="button"
              onClick={onPrintLedger}
              disabled={isLoading}
              className={styles.buttonPrint}
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Ledger
              </span>
            </button>
          )}
        </div>
      </div>
    </form>
  );
};