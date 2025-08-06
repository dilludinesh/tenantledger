/**
 * Data export utilities
 */

import { LedgerEntry } from '@/types/ledger';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/validation';

export const exportToCSV = (entries: LedgerEntry[], filename = 'ledger-export.csv') => {
  const headers = ['Date', 'Tenant', 'Amount', 'Category', 'Description'];
  
  const sanitizeCell = (cell: string) => {
    let sanitized = cell.replace(/"/g, '""');
    if (/[,\=\+\-@"]/.test(sanitized)) {
      sanitized = `"${sanitized}"`;
    }
    return sanitized;
  };

  const csvContent = [
    headers.join(','),
    ...entries.map(entry => [
      formatDate(entry.date, 'yyyy-MM-dd'),
      sanitizeCell(entry.tenant),
      entry.amount.toString(),
      entry.category,
      sanitizeCell(entry.description)
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const generatePrintableReport = (entries: LedgerEntry[], title = 'Tenant Ledger Report') => {
  const summary = {
    totalIncome: entries
      .filter(e => ['Rent', 'Security Deposit'].includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0),
    totalExpenses: entries
      .filter(e => ['Maintenance', 'Utilities', 'Other'].includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0),
    get netIncome() {
      return this.totalIncome - this.totalExpenses;
    },
    entryCount: entries.length,
    categories: entries.reduce((acc, entry) => {
      acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
      return acc;
    }, {} as Record<string, number>)
  };

  const sanitizeHTML = (text: string) => {
    const el = document.createElement('div');
    el.innerText = text;
    return el.innerHTML;
  };
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${sanitizeHTML(title)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .amount { text-align: right; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${sanitizeHTML(title)}</h1>
        <p>Generated on ${formatDate(new Date(), 'PPP')}</p>
      </div>
      
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-grid">
          <div><strong>Total Income:</strong> ${formatCurrency(summary.totalIncome)}</div>
          <div><strong>Total Expenses:</strong> ${formatCurrency(summary.totalExpenses)}</div>
          <div><strong>Net Income:</strong> ${formatCurrency(summary.netIncome)}</div>
          <div><strong>Total Entries:</strong> ${summary.entryCount}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Tenant</th>
            <th>Category</th>
            <th>Description</th>
            <th class="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${entries.map(entry => `
            <tr>
              <td>${formatDate(entry.date, 'PP')}</td>
              <td>${sanitizeHTML(entry.tenant)}</td>
              <td>${sanitizeHTML(entry.category)}</td>
              <td>${sanitizeHTML(entry.description)}</td>
              <td class="amount">${formatCurrency(entry.amount)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  return html;
};

export const printReport = (entries: LedgerEntry[], title?: string) => {
  const html = generatePrintableReport(entries, title);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
};