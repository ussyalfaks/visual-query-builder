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
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    banned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  const PLAN_COLORS: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    pro: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
        <DatabaseZap className="h-10 w-10 animate-pulse" />
        <p className="text-sm">Executing query...</p>
      </div>
    );
  }

  if (results === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
        <Database className="h-10 w-10" />
        <p className="text-sm">Run the query to see results</p>
        <button
          onClick={() => runQuery(MOCK_DATA)}
          className="text-xs border border-border rounded-md px-4 py-2 hover:bg-muted transition-colors"
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
          <span className="text-sm font-medium">{results.length}</span>
          <span className="text-sm text-muted-foreground">of {MOCK_DATA.length} records matched</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          results.length === 0 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
        }`}>
          {Math.round(results.length / MOCK_DATA.length * 100)}% match rate
        </span>
        <div className="flex gap-2 ml-auto">
          {Array.from({ length: MOCK_DATA.length }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i < results.length ? 'bg-green-500' : 'bg-muted-foreground/20'}`}
            />
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground border border-dashed rounded-lg">
          <Database className="h-8 w-8" />
          <p className="text-sm">No records matched your query</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {COLS.map(col => (
                      <th
                        key={col}
                        className="text-left px-3 py-2.5 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap select-none"
                        onClick={() => handleSort(col)}
                      >
                        <div className="flex items-center gap-1">
                          <span className="capitalize">{col}</span>
                          {sortField === col
                            ? sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                            : <span className="h-3 w-3" />
                          }
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((row, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5 font-medium">{String(row.name)}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{String(row.age)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[String(row.status)] ?? ''}`}>
                          {String(row.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{String(row.country)}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{String(row.purchases)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${row.score}%` }} />
                          </div>
                          <span className="text-muted-foreground">{String(row.score)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[String(row.plan)] ?? ''}`}>
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-md border border-border text-xs disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="px-3 py-1.5 rounded-md border border-border text-xs disabled:opacity-40 hover:bg-muted transition-colors"
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
