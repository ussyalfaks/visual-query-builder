# Professional UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Visual Query Builder into a professional dark SaaS product with a marketing landing page at `/` and a full-height split-panel app at `/app`.

**Architecture:** In-place restyle — no new libraries. Replace CSS variables with a dark-first token set, add a new `/app` route with a split-panel shell that inlines the old Toolbar logic, replace `/` with a static landing page, then update each component's Tailwind classes to the new tokens.

**Tech Stack:** Next.js App Router, Tailwind CSS v4 (`@theme inline`), Zustand + Immer, `@dnd-kit`, Geist font, Lucide icons, Vitest

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `app/globals.css` | Dark token definitions, remove `.dark` block |
| Modify | `tailwind.config.ts` | Remove `darkMode: 'class'` |
| Modify | `app/layout.tsx` | Updated metadata |
| Replace | `app/page.tsx` | Static landing page |
| Create | `app/app/page.tsx` | Full-height app shell with top bar, split panel, status bar |
| Modify | `store/queryStore.ts` | Change `activeTab` default from `'builder'` to `'preview'`, remove `'builder'` from union type |
| Modify | `components/QueryBuilder.tsx` | Remove `<Toolbar>`, remove Builder tab, become right-panel tab controller |
| Delete | `components/toolbar/Toolbar.tsx` | Logic absorbed into `app/app/page.tsx` |
| Modify | `components/query-builder/LogicToggle.tsx` | Segmented pill, green AND / purple OR |
| Modify | `components/query-builder/ConditionRule.tsx` | Dark card, accent value border, no `dark:` classes |
| Modify | `components/query-builder/ValueInput.tsx` | Dark inputs, monospace, accent focus ring |
| Modify | `components/query-builder/ConditionGroup.tsx` | Logic-based border colors, no `dark:` classes |
| Modify | `components/results/ResultsPanel.tsx` | Dark table, dark badges, monospace cells |
| Modify | `components/preview/QueryPreview.tsx` | Dark code block, updated format toggle |

---

## Task 1: Color System

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace globals.css**

```css
@import "tailwindcss";

:root {
  --background: #050505;
  --surface: #0f0f0f;
  --surface-raised: #161616;
  --surface-hover: #1e1e1e;
  --foreground: #f5f5f5;
  --muted-foreground: #a1a1aa;
  --subtle: #52525b;
  --border: #262626;
  --input: #262626;
  --muted: #1e1e1e;

  --accent: #10b981;
  --accent-hover: #059669;
  --accent-subtle: #064e3b;
  --accent-text: #d1fae5;

  --or-bg: #4c1d95;
  --or-text: #a78bfa;
  --or-subtle: #1a0d38;
  --or-border: #3b1f6e;

  --destructive: #ef4444;
  --destructive-foreground: #fef2f2;
  --warning: #f59e0b;
  --ring: #10b981;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist), system-ui, sans-serif;
}

@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-surface-hover: var(--surface-hover);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-subtle: var(--subtle);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-subtle: var(--accent-subtle);
  --color-accent-text: var(--accent-text);
  --color-or-bg: var(--or-bg);
  --color-or-text: var(--or-text);
  --color-or-subtle: var(--or-subtle);
  --color-or-border: var(--or-border);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-warning: var(--warning);
  --font-sans: var(--font-geist), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), monospace;
}

* { box-sizing: border-box; }
```

- [ ] **Step 2: Update tailwind.config.ts — remove darkMode**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};

export default config;
```

- [ ] **Step 3: Run tests — verify nothing broken**

```bash
cd /Users/mac/Downloads/visual-query-builder && npm test -- --run
```

Expected: all tests pass (token changes are CSS-only, logic is untouched)

- [ ] **Step 4: Commit**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "feat: dark-first token system, remove light mode"
```

---

## Task 2: Layout Metadata

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update metadata**

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: 'Visual Query Builder — No SQL required',
  description: 'Construct complex nested database filters visually. Drag-and-drop conditions, live SQL preview, and JSON export. No SQL knowledge needed.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
```

Note: `suppressHydrationWarning` is removed — it was only needed for the dark-mode class toggle which no longer exists.

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: update layout metadata for SaaS product"
```

---

## Task 3: Store — Remove Builder Tab

**Files:**
- Modify: `store/queryStore.ts`

- [ ] **Step 1: Update `activeTab` type and default**

In `store/queryStore.ts`, change the `activeTab` field in the `QueryStore` interface and its default value:

```ts
// Change the type (line ~18):
activeTab: 'preview' | 'results' | 'history' | 'json';

// Change the default (line ~95):
activeTab: 'preview',
```

Full updated interface field and initial value (only these two lines change):

```ts
// In QueryStore interface:
activeTab: 'preview' | 'results' | 'history' | 'json';

// In the store initial state (inside immer):
activeTab: 'preview',
```

Also update the `setActiveTab` action signature:

```ts
setActiveTab: (tab: QueryStore['activeTab']) => void;
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add store/queryStore.ts
git commit -m "feat: remove builder tab from store, default to preview"
```

---

## Task 4: QueryBuilder — Right Panel Only

**Files:**
- Modify: `components/QueryBuilder.tsx`

- [ ] **Step 1: Replace QueryBuilder.tsx**

QueryBuilder becomes a self-contained right-panel tab controller. All keyboard shortcuts and Toolbar logic move to the app shell (Task 5). Remove the `'builder'` tab entirely.

```tsx
'use client';
import { useQueryStore } from '@/store/queryStore';
import { QueryPreview } from './preview/QueryPreview';
import { ResultsPanel } from './results/ResultsPanel';
import { HistoryPanel } from './toolbar/HistoryPanel';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'preview' as const, label: 'Preview' },
  { id: 'results' as const, label: 'Results' },
  { id: 'json' as const, label: 'JSON' },
  { id: 'history' as const, label: 'History' },
];

export function QueryBuilder() {
  const { activeTab, setActiveTab, results, history, root } = useQueryStore();

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'border-accent text-foreground'
                : 'border-transparent text-subtle hover:text-muted-foreground'
            )}
          >
            {tab.label}
            {tab.id === 'results' && results !== null && (
              <span className={cn(
                'ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                results.length > 0
                  ? 'bg-accent-subtle text-accent'
                  : 'bg-surface-raised text-subtle'
              )}>
                {results.length}
              </span>
            )}
            {tab.id === 'history' && history.length > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-surface-raised text-subtle font-medium">
                {history.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'preview' && <QueryPreview />}
        {activeTab === 'results' && <ResultsPanel />}
        {activeTab === 'json' && (
          <div className="rounded-lg border border-border bg-surface-raised overflow-hidden">
            <pre className="p-4 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed text-accent-text max-h-[500px] overflow-y-auto">
              {JSON.stringify(root, null, 2)}
            </pre>
          </div>
        )}
        {activeTab === 'history' && <HistoryPanel />}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
```

Expected: all tests pass — ConditionGroup tests don't test QueryBuilder tabs

- [ ] **Step 3: Commit**

```bash
git add components/QueryBuilder.tsx
git commit -m "feat: QueryBuilder becomes right-panel tab controller, remove Toolbar + Builder tab"
```

---

## Task 5: App Shell at `/app`

**Files:**
- Create: `app/app/page.tsx`

- [ ] **Step 1: Create the directory and page**

```bash
mkdir -p /Users/mac/Downloads/visual-query-builder/app/app
```

- [ ] **Step 2: Write `app/app/page.tsx`**

```tsx
'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Play, Undo2, RotateCcw, ChevronDown,
  BookmarkPlus, Upload, Download, Trash2, AlertCircle,
} from 'lucide-react';
import { useQueryStore } from '@/store/queryStore';
import { ConditionGroup } from '@/components/query-builder/ConditionGroup';
import { QueryBuilder } from '@/components/QueryBuilder';
import { MOCK_DATA } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function AppPage() {
  const {
    root, schema, errors, history, isRunning, presets, results,
    runQuery, undo, resetQuery, savePreset, loadPreset, deletePreset, importQuery,
  } = useQueryStore();

  const [showPresets, setShowPresets] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const errorCount = Object.keys(errors).length;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runQuery(MOCK_DATA);
    }
  }, [undo, runQuery]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(root, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'query.json';
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try { importQuery(ev.target?.result as string); }
      catch { alert('Invalid query JSON file'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    savePreset(saveName.trim());
    setSaveName('');
    setShowSave(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* TOP BAR */}
      <header className="h-11 flex items-center gap-2 px-5 border-b border-border bg-surface shrink-0">
        <a href="/" className="flex items-center gap-2 mr-1">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-black leading-none">Q</span>
          </div>
          <span className="text-sm font-bold tracking-tight">QueryBuilder</span>
        </a>
        <span className="text-border font-light">/</span>
        <span className="text-sm text-muted-foreground">Untitled query</span>

        <div className="flex-1" />

        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-destructive/10 border border-destructive/20 text-destructive font-medium">
            <AlertCircle className="h-3 w-3" />
            {errorCount} error{errorCount > 1 ? 's' : ''}
          </span>
        )}

        <div className="h-4 w-px bg-border mx-1" />

        <button
          onClick={undo}
          disabled={history.length === 0}
          title="Undo (Ctrl+Z)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted-foreground bg-surface-raised border border-border hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <Undo2 className="h-3 w-3" /> Undo
        </button>
        <button
          onClick={resetQuery}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted-foreground bg-surface-raised border border-border hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Presets dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresets(p => !p)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted-foreground bg-surface-raised border border-border hover:text-foreground transition-colors"
          >
            <ChevronDown className="h-3 w-3" /> Presets
          </button>
          {showPresets && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg shadow-xl min-w-52 overflow-hidden">
              {presets.length === 0 && (
                <div className="px-4 py-3 text-xs text-subtle">No saved presets</div>
              )}
              {presets.map(p => (
                <div key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-surface-raised group">
                  <button
                    className="flex-1 text-left text-xs text-foreground"
                    onClick={() => { loadPreset(p.query); setShowPresets(false); }}
                  >
                    {p.name}
                  </button>
                  <button
                    onClick={() => deletePreset(p.id)}
                    className="opacity-0 group-hover:opacity-100 text-subtle hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="border-t border-border p-2">
                {showSave ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Preset name..."
                      value={saveName}
                      onChange={e => setSaveName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSave()}
                      className="flex-1 h-7 rounded border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <button
                      onClick={handleSave}
                      className="text-xs px-2 py-1 rounded bg-accent text-black font-semibold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSave(true)}
                    className="flex items-center gap-1.5 text-xs text-subtle hover:text-foreground w-full"
                  >
                    <BookmarkPlus className="h-3 w-3" /> Save current as preset
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-border mx-1" />

        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted-foreground bg-surface-raised border border-border hover:text-foreground transition-colors"
        >
          <Upload className="h-3 w-3" /> Import
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted-foreground bg-surface-raised border border-border hover:text-foreground transition-colors"
        >
          <Download className="h-3 w-3" /> Export
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        <button
          onClick={() => runQuery(MOCK_DATA)}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-accent text-black hover:bg-accent-hover disabled:opacity-50 transition-colors"
        >
          <Play className="h-3 w-3" />
          {isRunning ? 'Running…' : 'Run query'}
        </button>
      </header>

      {/* SPLIT PANEL */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Conditions */}
        <div className="w-1/2 border-r border-border flex flex-col overflow-hidden">
          <div className="flex items-center px-4 py-2.5 border-b border-border/40 shrink-0">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-subtle">
              Conditions
            </span>
            <span className="ml-auto text-[9px] text-subtle">⌘↵ to run</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <ConditionGroup group={root} depth={0} />
          </div>
        </div>

        {/* RIGHT: Output */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <QueryBuilder />
        </div>
      </div>

      {/* STATUS BAR */}
      <div className="h-7 flex items-center px-5 border-t border-border/40 bg-surface shrink-0">
        <span className="text-[9px] text-subtle">
          {schema.length} fields · {MOCK_DATA.length} mock records
        </span>
        {errorCount > 0 && (
          <>
            <span className="mx-2 text-subtle text-[9px]">·</span>
            <span className="text-[9px] text-destructive">
              {errorCount} validation error{errorCount > 1 ? 's' : ''}
            </span>
          </>
        )}
        <span className="ml-auto text-[9px] text-subtle">⌘Z undo · ⌘↵ run</span>
      </div>

    </div>
  );
}
```

- [ ] **Step 3: Verify the app route loads**

```bash
npm run dev
```

Open http://localhost:3000/app — verify the split panel loads with the conditions builder on the left and tabs on the right. Run a query, verify results appear in the Results tab. Test Undo, Reset, Presets, Import/Export. Close dev server.

- [ ] **Step 4: Run tests**

```bash
npm test -- --run
```

- [ ] **Step 5: Commit**

```bash
git add app/app/page.tsx
git commit -m "feat: add /app route with full-height split-panel shell"
```

---

## Task 6: Landing Page

**Files:**
- Replace: `app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx with the landing page**

```tsx
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-accent flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-black leading-none">Q</span>
            </div>
            <span className="text-sm font-bold tracking-tight">Visual Query Builder</span>
          </div>
          <div className="flex items-center gap-6 ml-auto">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Link
              href="/app"
              className="text-sm font-semibold bg-accent text-black px-4 py-1.5 rounded-md hover:bg-accent-hover transition-colors"
            >
              Get started free →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pt-24 pb-20 text-center px-6">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-100"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.10) 0%, transparent 100%)' }}
        />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-accent-subtle border border-accent-subtle/60 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-xs text-accent font-medium">No SQL required</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-5 max-w-2xl mx-auto">
          Build database queries{' '}
          <span className="text-accent">visually.</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Construct complex nested filters with drag-and-drop.
          See the SQL update in real time. Export to JSON or SQL.
          No database expertise needed.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <Link
            href="/app"
            className="bg-accent text-black font-bold px-6 py-3 rounded-lg text-sm hover:bg-accent-hover transition-colors"
          >
            Start building for free →
          </Link>
          <a
            href="#features"
            className="border border-border text-muted-foreground font-medium px-6 py-3 rounded-lg text-sm hover:text-foreground hover:border-muted-foreground transition-colors"
          >
            See features ↓
          </a>
        </div>

        {/* Product screenshot */}
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-xl border border-border overflow-hidden"
            style={{ boxShadow: '0 0 0 1px #1a1a1a, 0 32px 64px rgba(0,0,0,0.6)' }}
          >
            {/* Browser chrome */}
            <div className="bg-surface-raised border-b border-border px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-accent/60" />
              </div>
              <div className="flex-1 bg-background border border-border rounded px-3 py-1 text-xs text-subtle font-mono">
                localhost:3000/app
              </div>
            </div>

            {/* App top bar (static mockup) */}
            <div className="bg-surface border-b border-border px-5 py-2.5 flex items-center gap-2">
              <div className="flex items-center gap-2 mr-2">
                <div className="w-4 h-4 rounded bg-accent flex items-center justify-center">
                  <span className="text-[8px] font-black text-black">Q</span>
                </div>
                <span className="text-xs font-bold">QueryBuilder</span>
              </div>
              <span className="text-border">/</span>
              <span className="text-xs text-muted-foreground">Untitled query</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground border border-border rounded px-2 py-1 bg-surface-raised">↩ Undo</span>
                <span className="text-xs text-muted-foreground border border-border rounded px-2 py-1 bg-surface-raised">⚙ Presets</span>
                <span className="text-xs font-bold bg-accent text-black rounded px-3 py-1">▶ Run query</span>
              </div>
            </div>

            {/* Split panel mockup */}
            <div className="flex" style={{ minHeight: '280px' }}>
              {/* Left: conditions */}
              <div className="w-1/2 border-r border-border p-4">
                <p className="text-[9px] uppercase tracking-widest text-subtle font-semibold mb-3">Conditions</p>
                <div className="border border-accent-subtle rounded-lg overflow-hidden">
                  <div className="bg-accent-subtle/30 px-3 py-2 flex items-center gap-3 border-b border-accent-subtle">
                    <span className="text-[10px] font-bold bg-accent-subtle text-accent px-2 py-0.5 rounded">AND</span>
                    <span className="text-[10px] text-subtle">3 conditions</span>
                  </div>
                  <div className="p-3 flex flex-col gap-2 bg-background">
                    {[
                      ['age', 'greater than', '25'],
                      ['status', 'equals', '"active"'],
                      ['plan', 'in array', '"pro", "enterprise"'],
                    ].map(([field, op, val]) => (
                      <div key={field} className="bg-surface-raised border border-border rounded px-3 py-2 flex items-center gap-2 text-xs">
                        <span className="text-subtle">⠿</span>
                        <span className="text-muted-foreground font-mono">{field}</span>
                        <span className="text-subtle">{op}</span>
                        <span className="text-accent-text font-mono">{val}</span>
                      </div>
                    ))}
                    <div className="flex gap-2 pt-1">
                      <span className="border border-dashed border-border text-subtle text-xs px-3 py-1 rounded">+ Add condition</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: live preview */}
              <div className="w-1/2 flex flex-col">
                <div className="flex border-b border-border">
                  {['Preview', 'Results', 'JSON', 'History'].map((t, i) => (
                    <span key={t} className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-px ${i === 0 ? 'border-accent text-foreground' : 'border-transparent text-subtle'}`}>{t}</span>
                  ))}
                </div>
                <div className="p-4">
                  <p className="text-[9px] uppercase tracking-widest text-subtle font-semibold mb-3">Generated SQL</p>
                  <div className="bg-surface-raised border border-border rounded-lg p-4 font-mono text-xs leading-relaxed">
                    <span className="text-subtle">SELECT * FROM records WHERE{'\n'}</span>
                    <span className="text-accent-text">{'  '}age &gt; 25{'\n'}</span>
                    <span className="text-subtle">{'  '}AND status = </span><span className="text-accent-text">'active'{'\n'}</span>
                    <span className="text-subtle">{'  '}AND plan IN (</span><span className="text-accent-text">'pro'</span><span className="text-subtle">, </span><span className="text-accent-text">'enterprise'</span><span className="text-subtle">)</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 bg-accent-subtle/20 border border-accent-subtle rounded-md px-3 py-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-xs text-accent font-semibold">14 records matched</span>
                    <span className="text-xs text-subtle ml-1">of 20 · 70%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-3">Features</p>
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to filter data</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '⬡', title: 'Unlimited nesting', desc: 'AND/OR groups nestable to any depth. Build logic as complex as your data requires.' },
              { icon: '⇅', title: 'Drag & drop', desc: 'Reorder conditions and groups freely. Reorganize without retyping a single thing.' },
              { icon: '◈', title: 'Live SQL & MongoDB preview', desc: 'See the generated query update in real time as you add and edit conditions.' },
              { icon: '↓', title: 'Import & export', desc: 'Save queries as JSON, load them back instantly, and share them with your team.' },
            ].map(f => (
              <div key={f.title} className="bg-surface border border-border rounded-xl p-6 hover:border-muted-foreground/30 transition-colors">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent flex items-center justify-center">
              <span className="text-[8px] font-black text-black">Q</span>
            </div>
            <span className="text-xs text-subtle">Visual Query Builder</span>
          </div>
          <div className="ml-auto flex items-center gap-6">
            <a href="#" className="text-xs text-subtle hover:text-muted-foreground transition-colors">Privacy</a>
            <a href="#" className="text-xs text-subtle hover:text-muted-foreground transition-colors">Terms</a>
            <a href="#" className="text-xs text-subtle hover:text-muted-foreground transition-colors">GitHub ↗</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
```

- [ ] **Step 2: Verify landing page**

```bash
npm run dev
```

Open http://localhost:3000 — verify the landing page loads with dark background, nav, hero, product screenshot mockup, features grid, footer. Click "Get started free →" — verify it navigates to `/app`. Close dev server.

- [ ] **Step 3: Run tests**

```bash
npm test -- --run
```

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add SaaS landing page at /"
```

---

## Task 7: Delete Toolbar.tsx

**Files:**
- Delete: `components/toolbar/Toolbar.tsx`

- [ ] **Step 1: Delete the file**

```bash
rm /Users/mac/Downloads/visual-query-builder/components/toolbar/Toolbar.tsx
```

- [ ] **Step 2: Verify no imports remain**

```bash
grep -r "from.*toolbar/Toolbar\|from.*Toolbar'" /Users/mac/Downloads/visual-query-builder/components /Users/mac/Downloads/visual-query-builder/app
```

Expected: no output (QueryBuilder.tsx no longer imports it after Task 4)

- [ ] **Step 3: Run tests**

```bash
npm test -- --run
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: delete Toolbar.tsx, logic now lives in app shell"
```

---

## Task 8: LogicToggle Restyling

**Files:**
- Modify: `components/query-builder/LogicToggle.tsx`

- [ ] **Step 1: Replace LogicToggle.tsx**

```tsx
'use client';
import { memo } from 'react';
import { useQueryStore } from '@/store/queryStore';
import { cn } from '@/lib/utils';

interface Props {
  groupId: string;
  logic: 'AND' | 'OR';
}

export const LogicToggle = memo(function LogicToggle({ groupId, logic }: Props) {
  const setLogic = useQueryStore(s => s.setLogic);

  return (
    <div
      className="inline-flex rounded overflow-hidden border border-border shrink-0 text-[11px] font-bold"
      role="group"
      aria-label="Logic operator"
    >
      <button
        onClick={() => setLogic(groupId, 'AND')}
        aria-pressed={logic === 'AND'}
        className={cn(
          'px-3 py-1 transition-colors border-r border-border',
          logic === 'AND'
            ? 'bg-accent-subtle text-accent'
            : 'bg-surface-raised text-subtle hover:text-muted-foreground'
        )}
      >
        AND
      </button>
      <button
        onClick={() => setLogic(groupId, 'OR')}
        aria-pressed={logic === 'OR'}
        className={cn(
          'px-3 py-1 transition-colors',
          logic === 'OR'
            ? 'bg-or-bg text-or-text'
            : 'bg-surface-raised text-subtle hover:text-muted-foreground'
        )}
      >
        OR
      </button>
    </div>
  );
});
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
```

- [ ] **Step 3: Commit**

```bash
git add components/query-builder/LogicToggle.tsx
git commit -m "feat: LogicToggle segmented pill — green AND, purple OR"
```

---

## Task 9: ConditionRule + ValueInput Restyling

**Files:**
- Modify: `components/query-builder/ConditionRule.tsx`
- Modify: `components/query-builder/ValueInput.tsx`

- [ ] **Step 1: Replace ConditionRule.tsx**

```tsx
'use client';
import { memo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, AlertCircle } from 'lucide-react';
import type { QueryRule } from '@/lib/types';
import { OPERATORS_BY_TYPE, OPERATOR_LABELS } from '@/lib/schema';
import { useQueryStore } from '@/store/queryStore';
import { ValueInput } from './ValueInput';
import { cn } from '@/lib/utils';

interface Props {
  rule: QueryRule;
  groupId: string;
}

export const ConditionRule = memo(function ConditionRule({ rule, groupId }: Props) {
  const { schema, errors, updateRule, removeRule } = useQueryStore();
  const error = errors[rule.id];
  const field = schema.find(f => f.key === rule.field)!;
  const availableOps = OPERATORS_BY_TYPE[field?.type ?? 'string'] ?? [];

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: rule.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleFieldChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateRule(groupId, rule.id, { field: e.target.value });
  }, [groupId, rule.id, updateRule]);

  const handleOpChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateRule(groupId, rule.id, { operator: e.target.value as QueryRule['operator'] });
  }, [groupId, rule.id, updateRule]);

  const handleValueChange = useCallback((value: string) => {
    updateRule(groupId, rule.id, { value });
  }, [groupId, rule.id, updateRule]);

  const handleRemove = useCallback(() => removeRule(groupId, rule.id), [groupId, rule.id, removeRule]);

  const selectCls = 'h-8 rounded border border-border bg-background px-2 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent shrink-0 transition-colors';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md border bg-surface-raised p-2 group transition-all',
        isDragging ? 'opacity-50 shadow-lg z-50' : 'opacity-100',
        error ? 'border-destructive/50' : 'border-border'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-subtle hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <select className={cn(selectCls, 'w-28')} value={rule.field} onChange={handleFieldChange}>
        {schema.map(f => (
          <option key={f.key} value={f.key}>{f.label}</option>
        ))}
      </select>

      <select className={cn(selectCls, 'w-32')} value={rule.operator} onChange={handleOpChange}>
        {availableOps.map(op => (
          <option key={op} value={op}>{OPERATOR_LABELS[op] || op}</option>
        ))}
      </select>

      <div className="flex-1 min-w-0 flex items-center gap-1">
        <ValueInput rule={rule} field={field} error={error} onChange={handleValueChange} />
      </div>

      {error && (
        <div className="group/err relative shrink-0">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <div className="absolute right-0 bottom-6 z-50 bg-destructive text-destructive-foreground text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover/err:opacity-100 transition-opacity pointer-events-none">
            {error}
          </div>
        </div>
      )}

      <button
        onClick={handleRemove}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-subtle hover:text-destructive transition-all"
        aria-label="Remove condition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
});
```

- [ ] **Step 2: Replace ValueInput.tsx**

```tsx
'use client';
import { memo } from 'react';
import type { QueryRule, FieldSchema } from '@/lib/types';
import { NO_VALUE_OPERATORS } from '@/lib/schema';
import { cn } from '@/lib/utils';

interface Props {
  rule: QueryRule;
  field: FieldSchema;
  error?: string;
  onChange: (value: string) => void;
}

export const ValueInput = memo(function ValueInput({ rule, field, error, onChange }: Props) {
  const base = cn(
    'h-8 rounded border bg-background px-2.5 text-xs font-mono text-accent-text focus:outline-none focus:ring-1 transition-colors',
    error
      ? 'border-destructive/60 focus:ring-destructive'
      : 'border-border focus:ring-accent focus:border-accent'
  );

  if (NO_VALUE_OPERATORS.includes(rule.operator)) {
    return <span className="text-xs text-subtle italic px-2 self-center">no value</span>;
  }

  if (field.type === 'enum') {
    if (['in array', 'not in array'].includes(rule.operator)) {
      return (
        <input
          type="text"
          className={cn(base, 'flex-1 min-w-0')}
          placeholder="val1, val2, val3"
          value={rule.value}
          onChange={e => onChange(e.target.value)}
        />
      );
    }
    return (
      <select
        className={cn(base, 'flex-1 min-w-0 text-accent-text')}
        value={rule.value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {field.values?.map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    );
  }

  if (field.type === 'date') {
    if (rule.operator === 'between') {
      return (
        <input
          type="text"
          className={cn(base, 'flex-1 min-w-0')}
          placeholder="2024-01-01, 2024-12-31"
          value={rule.value}
          onChange={e => onChange(e.target.value)}
        />
      );
    }
    return (
      <input
        type="date"
        className={cn(base, 'flex-1 min-w-0')}
        value={rule.value}
        onChange={e => onChange(e.target.value)}
      />
    );
  }

  if (field.type === 'number') {
    if (rule.operator === 'between') {
      return (
        <input
          type="text"
          className={cn(base, 'flex-1 min-w-0')}
          placeholder="18, 65"
          value={rule.value}
          onChange={e => onChange(e.target.value)}
        />
      );
    }
    return (
      <input
        type="number"
        className={cn(base, 'w-28')}
        placeholder="0"
        value={rule.value}
        onChange={e => onChange(e.target.value)}
      />
    );
  }

  return (
    <input
      type="text"
      className={cn(base, 'flex-1 min-w-0')}
      placeholder="Enter value..."
      value={rule.value}
      onChange={e => onChange(e.target.value)}
    />
  );
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- --run
```

- [ ] **Step 4: Commit**

```bash
git add components/query-builder/ConditionRule.tsx components/query-builder/ValueInput.tsx
git commit -m "feat: ConditionRule + ValueInput dark styling, accent value focus"
```

---

## Task 10: ConditionGroup Restyling

**Files:**
- Modify: `components/query-builder/ConditionGroup.tsx`

- [ ] **Step 1: Replace the DEPTH_COLORS, DEPTH_BG, and group header in ConditionGroup.tsx**

Replace the constants and the JSX. Only the styling changes — all DnD, collapse, and store logic stays identical.

```tsx
'use client';
import { memo, useCallback } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor,
  PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { ChevronDown, ChevronRight, Plus, FolderPlus, Trash2, AlertCircle, GripVertical } from 'lucide-react';
import { SortableGroup } from './SortableGroup';
import type { QueryGroup } from '@/lib/types';
import { useQueryStore } from '@/store/queryStore';
import { ConditionRule } from './ConditionRule';
import { LogicToggle } from './LogicToggle';
import { cn } from '@/lib/utils';

interface Props {
  group: QueryGroup;
  depth: number;
  dragHandleListeners?: SyntheticListenerMap;
  dragHandleAttributes?: DraggableAttributes;
}

const LOGIC_BORDER = {
  AND: 'border-accent-subtle',
  OR: 'border-or-border',
};

const LOGIC_HEADER_BG = {
  AND: 'bg-accent-subtle/20',
  OR: 'bg-or-subtle',
};

const LOGIC_HEADER_BORDER = {
  AND: 'border-accent-subtle',
  OR: 'border-or-border',
};

const DEPTH_BG = ['', 'bg-surface/30', 'bg-surface/50', 'bg-surface/70', 'bg-surface'];

export const ConditionGroup = memo(function ConditionGroup({ group, depth, dragHandleListeners, dragHandleAttributes }: Props) {
  const { addRule, addGroup, removeGroup, reorderRules, reorderGroups, toggleCollapse, collapsed, errors } = useQueryStore();

  const isCollapsed = collapsed.has(group.id);
  const totalItems = group.rules.length + group.groups.length;
  const borderClass = LOGIC_BORDER[group.logic];
  const headerBgClass = LOGIC_HEADER_BG[group.logic];
  const headerBorderClass = LOGIC_HEADER_BORDER[group.logic];
  const bgClass = DEPTH_BG[Math.min(depth, DEPTH_BG.length - 1)];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = group.rules.findIndex(r => r.id === active.id);
    const toIndex = group.rules.findIndex(r => r.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) reorderRules(group.id, fromIndex, toIndex);
  }, [group.id, group.rules, reorderRules]);

  const groupSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleGroupDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = group.groups.findIndex(g => g.id === active.id);
    const toIndex = group.groups.findIndex(g => g.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) reorderGroups(group.id, fromIndex, toIndex);
  }, [group.id, group.groups, reorderGroups]);

  const handleAddRule = useCallback(() => addRule(group.id), [group.id, addRule]);
  const handleAddGroup = useCallback(() => addGroup(group.id), [group.id, addGroup]);
  const handleRemove = useCallback(() => removeGroup(group.id), [group.id, removeGroup]);
  const handleToggle = useCallback(() => toggleCollapse(group.id), [group.id, toggleCollapse]);

  return (
    <div className={cn('rounded-lg border', borderClass, bgClass)}>
      {/* Group header */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2',
        headerBgClass,
        !isCollapsed && cn('border-b', headerBorderClass)
      )}>
        {dragHandleListeners && (
          <button
            {...dragHandleAttributes}
            {...dragHandleListeners}
            className="text-subtle hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none"
            aria-label="Drag group to reorder"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}

        <LogicToggle groupId={group.id} logic={group.logic} />

        <button
          onClick={handleToggle}
          className="flex items-center gap-1 text-xs text-subtle hover:text-muted-foreground transition-colors"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}
        >
          {isCollapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronDown className="h-3.5 w-3.5" />}
          <span>{totalItems} condition{totalItems !== 1 ? 's' : ''}</span>
        </button>

        <div className="flex-1" />

        {depth > 0 && (
          <button
            onClick={handleRemove}
            className="text-subtle hover:text-destructive transition-colors p-1 rounded"
            aria-label="Remove group"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {errors[group.id] && (
        <div className="mx-3 mt-2 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {errors[group.id]}
        </div>
      )}

      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
        )}
        aria-hidden={isCollapsed}
      >
        <div className="overflow-hidden">
          <div className="p-3 flex flex-col gap-2">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={group.rules.map(r => r.id)} strategy={verticalListSortingStrategy}>
                {group.rules.map(rule => (
                  <ConditionRule key={rule.id} rule={rule} groupId={group.id} />
                ))}
              </SortableContext>
            </DndContext>

            <DndContext sensors={groupSensors} collisionDetection={closestCenter} onDragEnd={handleGroupDragEnd}>
              <SortableContext items={group.groups.map(g => g.id)} strategy={verticalListSortingStrategy}>
                {group.groups.map(subGroup => (
                  <SortableGroup key={subGroup.id} group={subGroup} depth={depth + 1} />
                ))}
              </SortableContext>
            </DndContext>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddRule}
                className="flex items-center gap-1.5 text-xs text-subtle hover:text-muted-foreground border border-dashed border-border hover:border-muted-foreground rounded-md px-3 py-1.5 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add condition
              </button>
              <button
                onClick={handleAddGroup}
                className="flex items-center gap-1.5 text-xs text-subtle hover:text-muted-foreground border border-dashed border-border hover:border-muted-foreground rounded-md px-3 py-1.5 transition-colors"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                Add group
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
```

Expected: all ConditionGroup tests pass — "Add condition", "Add group", condition count text unchanged

- [ ] **Step 3: Commit**

```bash
git add components/query-builder/ConditionGroup.tsx
git commit -m "feat: ConditionGroup logic-based border colors, dark group headers"
```

---

## Task 11: ResultsPanel Restyling

**Files:**
- Modify: `components/results/ResultsPanel.tsx`

- [ ] **Step 1: Replace ResultsPanel.tsx**

```tsx
'use client';
import { useState } from 'react';
import { Database, DatabaseZap, ChevronUp, ChevronDown } from 'lucide-react';
import { useQueryStore } from '@/store/queryStore';
import { MOCK_DATA } from '@/data/mockData';

type SortDir = 'asc' | 'desc';

export function ResultsPanel() {
  const { results, isRunning, runQuery } = useQueryStore();
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(0);
  };

  const sorted = results ? [...results].sort((a, b) => {
    if (!sortField) return 0;
    const av = a[sortField], bv = b[sortField];
    if (av === bv) return 0;
    const cmp = String(av) < String(bv) ? -1 : 1;
    return sortDir === 'asc' ? cmp : -cmp;
  }) : [];

  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  const COLS = ['name', 'age', 'status', 'country', 'purchases', 'score', 'plan'];

  const STATUS_COLORS: Record<string, string> = {
    active:   'bg-[#064e3b] text-[#6ee7b7]',
    inactive: 'bg-surface-raised text-subtle',
    pending:  'bg-[#451a03] text-[#fcd34d]',
    banned:   'bg-[#450a0a] text-[#fca5a5]',
  };
  const PLAN_COLORS: Record<string, string> = {
    free:       'bg-surface-raised text-subtle',
    pro:        'bg-[#1e3a5f] text-[#93c5fd]',
    enterprise: 'bg-[#2e1065] text-[#c4b5fd]',
  };

  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-subtle">
        <DatabaseZap className="h-10 w-10 animate-pulse text-accent" />
        <p className="text-sm">Executing query…</p>
      </div>
    );
  }

  if (results === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-subtle">
        <Database className="h-10 w-10" />
        <p className="text-sm">Run the query to see results</p>
        <button
          onClick={() => runQuery(MOCK_DATA)}
          className="text-xs border border-border rounded-md px-4 py-2 hover:bg-surface-raised transition-colors text-muted-foreground"
        >
          Run query
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{results.length}</span>
          <span className="text-sm text-muted-foreground">of {MOCK_DATA.length} records matched</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
          results.length === 0
            ? 'bg-[#450a0a] text-[#fca5a5]'
            : 'bg-accent-subtle text-accent'
        }`}>
          {Math.round(results.length / MOCK_DATA.length * 100)}% match rate
        </span>
        <div className="flex gap-1 ml-auto">
          {Array.from({ length: MOCK_DATA.length }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i < results.length ? 'bg-accent' : 'bg-surface-raised'}`}
            />
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-subtle border border-dashed border-border rounded-lg">
          <Database className="h-8 w-8" />
          <p className="text-sm">No records matched your query</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-surface-raised">
                    {COLS.map(col => (
                      <th
                        key={col}
                        className="text-left px-3 py-2.5 font-semibold text-subtle uppercase tracking-wider cursor-pointer hover:text-muted-foreground transition-colors whitespace-nowrap select-none text-[10px]"
                        onClick={() => handleSort(col)}
                      >
                        <div className="flex items-center gap-1">
                          <span>{col}</span>
                          {sortField === col
                            ? sortDir === 'asc'
                              ? <ChevronUp className="h-3 w-3" />
                              : <ChevronDown className="h-3 w-3" />
                            : <span className="h-3 w-3 inline-block" />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((row, i) => (
                    <tr key={i} className="border-t border-border hover:bg-surface-raised transition-colors">
                      <td className="px-3 py-2.5 font-medium font-mono text-foreground">{String(row.name)}</td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">{String(row.age)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${STATUS_COLORS[String(row.status)] ?? 'bg-surface-raised text-subtle'}`}>
                          {String(row.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">{String(row.country)}</td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">{String(row.purchases)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 rounded-full bg-surface-raised overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${row.score}%` }} />
                          </div>
                          <span className="font-mono text-muted-foreground">{String(row.score)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${PLAN_COLORS[String(row.plan)] ?? 'bg-surface-raised text-subtle'}`}>
                          {String(row.plan)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-subtle">Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded border border-border text-muted-foreground disabled:opacity-30 hover:bg-surface-raised transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="px-3 py-1.5 rounded border border-border text-muted-foreground disabled:opacity-30 hover:bg-surface-raised transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
```

- [ ] **Step 3: Commit**

```bash
git add components/results/ResultsPanel.tsx
git commit -m "feat: ResultsPanel dark table, dark badges, monospace cells"
```

---

## Task 12: QueryPreview Restyling

**Files:**
- Modify: `components/preview/QueryPreview.tsx`

- [ ] **Step 1: Replace QueryPreview.tsx**

```tsx
'use client';
import { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useQueryStore } from '@/store/queryStore';
import { toSQL, toMongo } from '@/lib/formatters';
import { cn } from '@/lib/utils';

export function QueryPreview() {
  const { root, schema, activeFormat, setActiveFormat } = useQueryStore();
  const [copied, setCopied] = useState(false);

  const preview = useMemo(() => {
    if (activeFormat === 'sql') return toSQL(root, schema);
    return toMongo(root, schema);
  }, [root, schema, activeFormat]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {/* Format toggle */}
        <div className="inline-flex rounded overflow-hidden border border-border text-xs font-mono font-semibold">
          {(['sql', 'mongo'] as const).map(fmt => (
            <button
              key={fmt}
              onClick={() => setActiveFormat(fmt)}
              className={cn(
                'px-3 py-1.5 transition-colors',
                activeFormat === fmt
                  ? 'bg-accent-subtle text-accent'
                  : 'bg-surface-raised text-subtle hover:text-muted-foreground',
                fmt === 'sql' && 'border-r border-border'
              )}
            >
              {fmt === 'sql' ? 'SQL' : 'MongoDB'}
            </button>
          ))}
        </div>

        <span className="text-xs text-subtle">Live — updates as you build</span>

        <div className="flex-1" />

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-subtle hover:text-muted-foreground transition-colors"
        >
          {copied
            ? <Check className="h-3.5 w-3.5 text-accent" />
            : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="relative rounded-lg border border-border bg-surface-raised overflow-hidden">
        <pre className="p-4 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed text-accent-text">
          {preview}
        </pre>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run all tests one final time**

```bash
npm test -- --run
```

Expected: all 80+ tests pass

- [ ] **Step 3: Start dev server and do a full smoke test**

```bash
npm run dev
```

Verify:
- `/` — landing page loads, dark background, nav, hero with product screenshot, features, footer
- `/` → "Get started free" → navigates to `/app`
- `/app` — split panel loads, conditions on left, tabs on right
- Add a condition, change field/operator/value — rule updates
- Run query (⌘↵ or Run button) — results appear in Results tab with dark table
- Switch to Preview tab — SQL renders in dark code block
- Switch to JSON tab — raw JSON in accent-text color
- Undo — last action reverts
- Reset — builder resets to single empty rule
- Presets dropdown — loads a preset, conditions update
- Export — downloads `query.json`
- Logo link → navigates back to `/`

- [ ] **Step 4: Final commit**

```bash
git add components/preview/QueryPreview.tsx
git commit -m "feat: QueryPreview dark code block, accent format toggle"
```
