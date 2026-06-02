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
