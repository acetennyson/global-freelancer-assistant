'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const options: { value: string; icon: string }[] = [
    { value: 'light', icon: '☀️' },
    { value: 'dark', icon: '🌙' },
    { value: 'system', icon: '💻' },
  ];

  return (
    <div className="flex items-center gap-0.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-0.5">
      {options.map(o => (
        <button key={o.value} onClick={() => setTheme(o.value)}
          title={o.value}
          className={`px-2 py-1 rounded-md text-xs transition-colors ${theme === o.value ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
          {o.icon}
        </button>
      ))}
    </div>
  );
}
