import React, { useState, ChangeEvent, FormEvent } from 'react';
import { format } from 'date-fns';
import { CATEGORIES } from '@/types/ledger';
import { validateLedgerEntry, sanitizeInput } from '@/utils/validation';
import styles from './EntryForm.module.css';

interface EntryFormProps {
  onSubmit: (data: {
    tenant: string;
    amount: string;
    category: string;
    description: string;
    date: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const EntryForm: React.FC<EntryFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    tenant: '',
    amount: '',
    category: 'Rent',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    const validation = validateLedgerEntry(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onSubmit(formData);
      // Reset form on successful submission
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        tenant: '',
        amount: '',
        category: 'Rent',
        description: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      tenant: '',
      amount: '',
      category: 'Rent',
      description: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="date" className={styles.label}>
            Date
          </label>
          <div className="relative">
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
          </div>
          {errors.date && <p className={styles.errorText}>{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="tenant" className={styles.label}>
            Tenant Name
          </label>
          <input
            type="text"
            id="tenant"
            name="tenant"
            value={formData.tenant}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="Enter tenant name"
            required
          />
          {errors.tenant && <p className={styles.errorText}>{errors.tenant}</p>}
        </div>

        <div>
          <label htmlFor="amount" className={styles.label}>
            Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">₹</span>
            </div>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`${styles.formInput} pl-8`}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          {errors.amount && <p className={styles.errorText}>{errors.amount}</p>}
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
            className={styles.formSelect}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={styles.label}>
          Description (Optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className={styles.formTextarea}
          placeholder="Add any additional notes"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          className={styles.buttonSecondary}
          disabled={isLoading}
        >
          Reset
        </button>
        <button
          type="submit"
          className={styles.buttonPrimary}
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Entry'}
        </button>
      </div>
    </form>
  );
};
