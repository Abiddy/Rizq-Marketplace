import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} bg-black min-h-screen flex flex-col`}>
        <AuthProvider>
          <ChatProvider>
            <NavbarWrapper />
            {children}
          </ChatProvider>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}