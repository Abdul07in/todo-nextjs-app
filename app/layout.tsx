import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TodoApp - Organize Your Life',
  description: 'A modern todo and note-taking application built with Next.js and Supabase',
  keywords: ['todo', 'notes', 'productivity', 'task management', 'organization'],
  authors: [{ name: 'TodoApp Team' }],
  creator: 'TodoApp',
  publisher: 'TodoApp',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'TodoApp - Organize Your Life',
    description: 'A modern todo and note-taking application built with Next.js and Supabase',
    url: '/',
    siteName: 'TodoApp',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TodoApp - Organize Your Life',
    description: 'A modern todo and note-taking application built with Next.js and Supabase',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}