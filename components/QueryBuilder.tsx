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
