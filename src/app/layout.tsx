import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Rizq Marketplace',
  description: 'Connect with freelancers and clients',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}