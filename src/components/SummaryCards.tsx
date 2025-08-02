/**
 * Summary cards component for dashboard overview
 */

import React from 'react';
import { LedgerEntry } from '@/types/ledger';
import { formatCurrency } from '@/utils/validation';

interface SummaryCardsProps {
  entries: LedgerEntry[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ entries }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });

  const totalIncome = entries
    .filter(e => ['Rent', 'Security Deposit'].includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);
    
  const totalExpenses = entries
    .filter(e => ['Maintenance', 'Utilities', 'Other'].includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  const thisMonthIncome = thisMonthEntries
    .filter(e => ['Rent', 'Security Deposit'].includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  const thisMonthExpenses = thisMonthEntries
    .filter(e => ['Maintenance', 'Utilities', 'Other'].includes(e.category))
    .reduce((sum, e) => sum + e.amount, 0);

  const uniqueTenants = new Set(entries.map(e => e.tenant)).size;

  const cards = [
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      subtitle: `This month: ${formatCurrency(thisMonthIncome)}`,
      color: 'green',
      icon: '💰'
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      subtitle: `This month: ${formatCurrency(thisMonthExpenses)}`,
      color: 'red',
      icon: '💸'
    },
    {
      title: 'Net Income',
      value: formatCurrency(totalIncome - totalExpenses),
      subtitle: `This month: ${formatCurrency(thisMonthIncome - thisMonthExpenses)}`,
      color: totalIncome - totalExpenses >= 0 ? 'green' : 'red',
      icon: '📊'
    },
    {
      title: 'Active Tenants',
      value: uniqueTenants.toString(),
      subtitle: `${entries.length} total entries`,
      color: 'blue',
      icon: '👥'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`p-6 rounded-lg border-2 ${getColorClasses(card.color)} transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-75">{card.title}</h3>
            <span className="text-2xl">{card.icon}</span>
          </div>
          <div className="text-2xl font-bold mb-1">{card.value}</div>
          <div className="text-xs opacity-60">{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
};