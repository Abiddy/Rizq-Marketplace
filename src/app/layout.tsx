import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import NavbarWrapper from './components/NavbarWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rizq Marketplace',
  description: 'Connect with freelance talent and find projects',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black min-h-screen flex flex-col`}>
        <AuthProvider>
          <NavbarWrapper />
          {children}
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}