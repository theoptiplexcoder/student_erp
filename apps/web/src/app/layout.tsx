import React from 'react';
import type { Metadata } from 'next';
import { Outfit, DM_Sans } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const displayFont = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Student ERP | Modern Academic Management Platform',
  description:
    'Run your entire institution from one platform. Student ERP digitizes the complete academic lifecycle from admission to alumni.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground min-h-screen overflow-x-hidden antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
