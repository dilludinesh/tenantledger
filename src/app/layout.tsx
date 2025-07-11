import type { Metadata } from 'next';
import './globals.css';
import Providers from './Providers';
import ClientBody from './ClientBody';

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
        <link rel="icon" href="data:image/x-icon;,0" />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Providers>
          <ClientBody>
            {children}
          </ClientBody>
        </Providers>
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
