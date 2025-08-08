import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Tenant Ledger',
  description: 'Manage your tenant payments and records',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}