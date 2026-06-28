'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeSwitcher() {
  const { setTheme, theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  if (!mounted) {
    return (
      <button
        type='button'
        className='inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
        aria-label='Toggle theme'
      >
        <Sun className='h-4 w-4' />
        <span>Light mode</span>
      </button>
    );
  }

  return (
    <button
      type='button'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
      aria-label='Toggle theme'
    >
      {isDark ? (
        <>
          <Sun className='h-4 w-4' />
          <span>Light mode</span>
        </>
      ) : (
        <>
          <Moon className='h-4 w-4' />
          <span>Dark mode</span>
        </>
      )}
    </button>
  );
}
