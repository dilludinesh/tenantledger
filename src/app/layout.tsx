import type { Metadata } from 'next';
import './globals.css';
import Providers from './Providers';
import ClientBody from './ClientBody';
import { ErrorBoundary } from '@/components/ErrorBoundary';


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
      <body className="min-h-screen">
        <ErrorBoundary>
          <Providers>
            <ClientBody>
              {children}
            </ClientBody>
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