'use client';
import { useState, useEffect } from 'react';

export function useTheme(): 'vs-dark' | 'vs' {
  const [monacoTheme, setMonacoTheme] = useState<'vs-dark' | 'vs'>('vs-dark');

  useEffect(() => {
    const html = document.documentElement;

    const resolve = () =>
      setMonacoTheme(html.classList.contains('light') ? 'vs' : 'vs-dark');

    resolve();

    const observer = new MutationObserver(resolve);
    observer.observe(html, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return monacoTheme;
}
