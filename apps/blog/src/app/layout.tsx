import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import '@hackernoon/pixel-icon-library/fonts/iconfont.css';
import './globals.css';
import { ThemeProvider } from '../providers/theme-provider';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/footer';
import { GoogleAnalytics } from '@/components/google-analytics';
import { siteMetadata } from '@/lib/metadata';

const suit = localFont({
  src: './fonts/SUIT-Variable.woff2',
  display: 'swap',
  variable: '--font-suit',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko' suppressHydrationWarning>
      <body
        className={`${suit.variable} ${inter.variable} font-suit bg-background selection:bg-accent antialiased`}
      >
        <main className='mx-auto grid min-h-dvh w-full max-w-7xl grid-flow-row auto-rows-auto grid-cols-8 items-start gap-0 px-2 sm:grid-cols-[repeat(16,1fr)] md:grid-cols-[repeat(24,1fr)] md:px-6'>
          <ThemeProvider>
            <NavBar />
            {children}
            <Footer />
          </ThemeProvider>
        </main>
        <Analytics />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
