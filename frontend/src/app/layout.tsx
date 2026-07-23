import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aegis Sandbox AI',
  description: 'Professional digital forensics, OSINT, IPDR analysis, ransomware investigation, evidence management, and AI-assisted reporting platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-cyber-bg text-cyber-text min-h-screen antialiased">
        {children}
        <Toaster position="bottom-right" toastOptions={{ className: 'cyber-toast' }} />
      </body>
    </html>
  );
}
