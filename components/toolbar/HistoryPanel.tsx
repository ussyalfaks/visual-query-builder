'use client';
import { History } from 'lucide-react';
import { useQueryStore } from '@/store/queryStore';

export function HistoryPanel() {
  const { history, undo } = useQueryStore();

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <History className="h-10 w-10" />
        <p className="text-sm">No history yet — make some changes</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        {history.length} snapshot{history.length !== 1 ? 's' : ''} saved. Use Undo to step back.
      </p>
      {[...history].reverse().map((snap, i) => {
        const totalRules = (function count(g: typeof snap): number {
          return g.rules.length + g.groups.reduce((acc, sg) => acc + count(sg), 0);
        })(snap);

        return (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
          >
            <History className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-sm">Snapshot {history.length - i}</p>
              <p className="text-xs text-muted-foreground">
                {totalRules} rule{totalRules !== 1 ? 's' : ''} · {snap.groups.length} group{snap.groups.length !== 1 ? 's' : ''} · {snap.logic}
              </p>
            </div>
            {i === 0 && (
              <button
                onClick={undo}
                className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
              >
                Restore
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
