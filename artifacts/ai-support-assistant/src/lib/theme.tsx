import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState, type ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}

export function ThemeToggle({
  variant = 'default',
}: {
  variant?: 'default' | 'sidebar' | 'labeled';
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = (mounted ? resolvedTheme : theme) === 'dark';
  const chrome =
    variant === 'sidebar'
      ? 'focus-ring rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent'
      : variant === 'labeled'
        ? 'focus-ring inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition hover:bg-muted'
        : 'focus-ring rounded-xl border border-border p-2.5 text-foreground transition hover:bg-muted';

  return (
    <button
      type="button"
      aria-label={active ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(active ? 'light' : 'dark')}
      className={chrome}
      data-testid="button-theme-toggle"
    >
      {active ? <Sun size={15} /> : <Moon size={15} />}
      {variant === 'labeled' ? <span>{active ? 'Light' : 'Dark'}</span> : null}
    </button>
  );
}
