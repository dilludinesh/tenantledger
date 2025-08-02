import type { Metadata } from 'next';
import './globals.css';
import Providers from './Providers';
import ClientBody from './ClientBody';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SecurityDashboard } from '@/components/SecurityDashboard';

export const metadata: Metadata = {
  title: 'Tenant Ledger',
  description: 'Manage your tenant payments and records',
};

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Tenant Ledger</title>
        <meta name="description" content="Manage tenant finances" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning={true}>
        <ErrorBoundary>
          <Providers>
            <ClientBody>
              {children}
            </ClientBody>
            <SecurityDashboard />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RootLayoutContent>{children}</RootLayoutContent>;
}
