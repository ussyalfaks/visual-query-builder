'use client';
import { useState } from 'react';
import { Database, DatabaseZap, ChevronUp, ChevronDown } from 'lucide-react';
import { useQueryStore } from '@/store/queryStore';
import { MOCK_DATA } from '@/data/mockData';

type SortDir = 'asc' | 'desc';

export function ResultsPanel() {
  const { results, isRunning, runQuery, schema, customData } = useQueryStore();
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  const activeData = customData ?? MOCK_DATA;
  const cols = schema.map(f => ({ key: f.key, label: f.label }));

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

  const STATUS_COLORS: Record<string, string> = {
    active:    'bg-[#064e3b] text-[#6ee7b7]',
    inactive:  'bg-surface-raised text-subtle',
    pending:   'bg-[#451a03] text-[#fcd34d]',
    banned:    'bg-[#450a0a] text-[#fca5a5]',
    cancelled: 'bg-[#450a0a] text-[#fca5a5]',
    shipped:   'bg-[#1e3a5f] text-[#93c5fd]',
    delivered: 'bg-[#064e3b] text-[#6ee7b7]',
  };

  function renderCell(col: { key: string }, row: Record<string, unknown>) {
    const val = row[col.key];
    const str = val === null || val === undefined ? '—' : String(val);
    const fieldSchema = schema.find(f => f.key === col.key);

    if (fieldSchema?.type === 'enum' && STATUS_COLORS[str]) {
      return (
        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${STATUS_COLORS[str]}`}>
          {str}
        </span>
      );
    }
    if (fieldSchema?.type === 'boolean') {
      return (
        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${val ? 'bg-[#064e3b] text-[#6ee7b7]' : 'bg-surface-raised text-subtle'}`}>
          {str}
        </span>
      );
    }
    if (fieldSchema?.type === 'number') {
      return <span className="font-mono text-muted-foreground">{str}</span>;
    }
    return <span className="font-mono text-muted-foreground truncate max-w-40 block">{str}</span>;
  }

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
          onClick={() => runQuery(activeData)}
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
          <span className="text-sm text-muted-foreground">of {activeData.length} records matched</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
          results.length === 0
            ? 'bg-[#450a0a] text-[#fca5a5]'
            : 'bg-accent-subtle text-accent'
        }`}>
          {activeData.length > 0 ? Math.round(results.length / activeData.length * 100) : 0}% match rate
        </span>
        <div className="flex gap-1 ml-auto flex-wrap max-w-30">
          {Array.from({ length: Math.min(activeData.length, 40) }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i < Math.round(results.length / activeData.length * Math.min(activeData.length, 40)) ? 'bg-accent' : 'bg-surface-raised'}`}
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
                    {cols.map(col => (
                      <th
                        key={col.key}
                        className="text-left px-3 py-2.5 font-semibold text-subtle uppercase tracking-wider cursor-pointer hover:text-muted-foreground transition-colors whitespace-nowrap select-none text-[10px]"
                        onClick={() => handleSort(col.key)}
                      >
                        <div className="flex items-center gap-1">
                          <span>{col.label}</span>
                          {sortField === col.key
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
                      {cols.map(col => (
                        <td key={col.key} className="px-3 py-2.5">
                          {renderCell(col, row)}
                        </td>
                      ))}
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
