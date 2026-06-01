'use client';
import { useEffect, useCallback } from 'react';
import { useQueryStore } from '@/store/queryStore';
import { ConditionGroup } from './query-builder/ConditionGroup';
import { QueryPreview } from './preview/QueryPreview';
import { ResultsPanel } from './results/ResultsPanel';
import { MOCK_DATA } from '@/data/mockData';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'builder', label: 'Builder' },
  { id: 'preview', label: 'Preview' },
  { id: 'results', label: 'Results' },
  { id: 'json', label: 'JSON' },
] as const;

export function QueryBuilder() {
  const { root, activeTab, setActiveTab, results, runQuery } = useQueryStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runQuery(MOCK_DATA);
    }
  }, [runQuery]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex items-center border-b border-border gap-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
            {tab.id === 'results' && results !== null && (
              <span className={cn(
                'ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-medium',
                results.length > 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                  : 'bg-muted text-muted-foreground'
              )}>
                {results.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-64">
        {activeTab === 'builder' && (
          <ConditionGroup group={root} depth={0} />
        )}
        {activeTab === 'preview' && <QueryPreview />}
        {activeTab === 'results' && <ResultsPanel />}
        {activeTab === 'json' && (
          <div className="rounded-lg border border-border bg-muted/50 overflow-hidden">
            <pre className="p-4 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed text-foreground max-h-[500px] overflow-y-auto">
              {JSON.stringify(root, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
