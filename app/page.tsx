import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

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
            <ThemeToggle />
            <Link
              href="/app"
              className="text-sm font-semibold bg-accent text-black px-4 py-1.5 rounded-md hover:bg-accent-hover transition-colors"
            >
              Get started →
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
            Start building →
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
