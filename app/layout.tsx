import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Fuse',
  description: 'Fast, lightweight, offline-first note-taking modeled after Google Keep',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-canvas text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}

