import './globals.css';

export const metadata = {
  title: 'Freelance Gigs App',
  description: 'A premium platform for freelance opportunities',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}