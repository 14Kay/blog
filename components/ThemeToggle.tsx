'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from "next-themes"
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button onClick={toggle} variant="ghost" size="icon" style={{ cursor: 'pointer' }}>
      {/* Light Mode: Show Moon (to switch to dark). Scale 1 when NOT dark. */}
      <Moon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      {/* Dark Mode: Show Sun (to switch to light). Scale 1 WHEN dark. */}
      <Sun className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
