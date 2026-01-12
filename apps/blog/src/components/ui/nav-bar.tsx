'use client';

import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { NavButton } from './nav-button';
import { useTheme } from 'next-themes';

const navItems = [
  { label: 'BLOG', href: '/', key: 'B' },
  {
    label: 'GITHUB',
    href: 'https://github.com/chan-byeong',
    target: '_blank',
    rel: 'noopener noreferrer',
    key: 'G',
  },
];

export const NavBar = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <nav className='fixed top-0 left-1/2 -translate-x-1/2 z-50 flex w-full items-center justify-between bg-background/80 px-2 md:px-8 py-2 backdrop-blur-md'>
      <div className='flex items-center gap-2'>
        {/* 로고 아이콘 -> 아이콘 만들고 수정 필요*/}
        <Link
          href='/'
          className='mr-2 flex h-6 w-6 items-center justify-center rounded bg-zinc-900 text-white transition-colors hover:bg-zinc-800'
        >
          <div className='h-2.5 w-2.5 -skew-x-12 border-2 border-white' />
        </Link>

        <NavigationMenu.Root>
          <NavigationMenu.List className='flex items-center gap-1'>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <NavigationMenu.Item key={item.label} asChild>
                  <NavButton
                    label={item.label}
                    shortcutKey={item.key}
                    href={item.href}
                    {...(item.target && { target: item.target })}
                    {...(item.rel && { rel: item.rel })}
                    active={isActive}
                  />
                </NavigationMenu.Item>
              );
            })}
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>

      <NavButton
        label={theme === 'dark' ? 'LIGHT' : 'DARK'}
        shortcutKey={theme === 'dark' ? 'L' : 'D'}
        active={false}
        onClick={() => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
        }}
        aria-label='theme toggle'
      />
    </nav>
  );
};
