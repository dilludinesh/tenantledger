import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EntryForm } from './EntryForm';
import { LedgerEntry } from '@/types/ledger';

// Mock the CSS module
jest.mock('./EntryForm.module.css', () => ({
  label: 'label',
  formInput: 'formInput',
  errorInput: 'errorInput',
  errorMessage: 'errorMessage',
}));

describe('EntryForm', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<EntryForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount (₹)')).toBeInTheDocument();
    expect(screen.getByLabelText('Tenant')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: 'Add Entry' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('should call onSubmit with form data when submitted with valid data', async () => {
    render(<EntryForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Tenant'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Amount (₹)'), {
      target: { value: '1000' }
    });
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Rent payment' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        date: expect.any(String),
        tenant: 'John Doe',
        amount: '1000',
        category: 'Rent',
        description: 'Rent payment'
      });
    });
  });

  it('should show validation errors for required fields', async () => {
    render(<EntryForm onSubmit={mockOnSubmit} />);
    
    // Clear the tenant and amount fields to ensure they're empty
    const tenantInput = screen.getByLabelText('Tenant') as HTMLInputElement;
    const amountInput = screen.getByLabelText('Amount (₹)') as HTMLInputElement;
    
    // Clear the fields
    fireEvent.change(tenantInput, { target: { name: 'tenant', value: '' } });
    fireEvent.change(amountInput, { target: { name: 'amount', value: '' } });
    
    // Verify fields are empty
    expect(tenantInput.value).toBe('');
    expect(amountInput.value).toBe('');
    
    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    
    await waitFor(() => {
      expect(screen.getByText('Tenant name is required')).toBeInTheDocument();
      expect(screen.getByText('Amount is required')).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should update form fields when editing an entry', () => {
    const mockEntry = {
      id: '1',
      date: new Date('2023-01-01'),
      tenant: 'John Doe',
      amount: 1000,
      category: 'Rent',
      description: 'January rent',
      userId: 'user1'
    };
    
    render(<EntryForm 
      onSubmit={mockOnSubmit} 
      entryToEdit={mockEntry as LedgerEntry & { id: string }}
    />);
    
    expect(screen.getByLabelText('Tenant')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Amount (₹)')).toHaveValue(1000);
    expect(screen.getByRole('button', { name: 'Update Entry' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should call onCancelEdit when cancel button is clicked during edit', () => {
    const mockOnCancelEdit = jest.fn();
    const mockEntry = {
      id: '1',
      date: new Date('2023-01-01'),
      tenant: 'John Doe',
      amount: 1000,
      category: 'Rent',
      description: 'January rent',
      userId: 'user1'
    };
    
    render(<EntryForm 
      onSubmit={mockOnSubmit} 
      entryToEdit={mockEntry as LedgerEntry & { id: string }}
      onCancelEdit={mockOnCancelEdit}
    />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    
    expect(mockOnCancelEdit).toHaveBeenCalled();
  });
});