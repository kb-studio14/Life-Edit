import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Navigation } from '@/components/navigation';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Life Edit',
  description: "Turn the life you've pinned into the life you live.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
