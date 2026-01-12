import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import '@hackernoon/pixel-icon-library/fonts/iconfont.css';
import './globals.css';
import { ThemeProvider } from '../components/theme-provider';
import { NavBar } from '@/components/ui/nav-bar';
import { Footer } from '@/components/footer';

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

export const metadata: Metadata = {
  title: 'Byeoung Blog',
  description: "Byeoung's Blog",
  icons: {
    icon: [
      { url: './icon.svg', type: 'image/svg+xml' },
      { url: './favicon.ico', sizes: 'any' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko' suppressHydrationWarning>
      <body
        className={`${suit.variable} ${inter.variable} font-suit antialiased bg-background selection:bg-accent`}
      >
        <main className='grid items-start w-full max-w-7xl mx-auto min-h-dvh auto-rows-auto grid-flow-row px-6 gap-0 grid-cols-8 md:grid-cols-[repeat(24,1fr)] sm:grid-cols-[repeat(16,1fr)]'>
          <ThemeProvider>
            <NavBar />
            {children}
            <Footer />
          </ThemeProvider>
        </main>
        <Analytics />
      </body>
    </html>
  );
}
