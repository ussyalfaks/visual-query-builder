'use client';
import { useState } from 'react';
import { Moon, Sun, Filter } from 'lucide-react';
import { QueryBuilder } from '@/components/QueryBuilder';

export default function Home() {
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    setDark(d => {
      document.documentElement.classList.toggle('dark', !d);
      return !d;
    });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <Filter className="h-5 w-5" />
          <span className="font-semibold text-base">Visual Query Builder</span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">Stage 8</span>
          <div className="flex-1" />
          <button
            onClick={toggleDark}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1">Query Builder</h1>
          <p className="text-muted-foreground text-sm">
            Visually construct complex queries with unlimited nested logic. No SQL required.
            Press <kbd className="text-xs border border-border rounded px-1 py-0.5 font-mono">⌘ Enter</kbd> to run.
          </p>
        </div>

        {/* Schema info */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground">Schema:</span>
          {[
            { label: 'name', type: 'string' },
            { label: 'age', type: 'number' },
            { label: 'status', type: 'enum' },
            { label: 'country', type: 'enum' },
            { label: 'purchases', type: 'number' },
            { label: 'score', type: 'number' },
            { label: 'plan', type: 'enum' },
            { label: 'createdAt', type: 'date' },
          ].map(f => (
            <span
              key={f.label}
              className="text-xs px-2 py-0.5 rounded-md border border-border font-mono"
            >
              {f.label}
              <span className="text-muted-foreground ml-1">:{f.type}</span>
            </span>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">{20} mock records</span>
        </div>

        <QueryBuilder />
      </div>
    </main>
  );
}
