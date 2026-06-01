'use client';
import { useQueryStore } from '@/store/queryStore';
import { ConditionGroup } from './query-builder/ConditionGroup';
import { QueryPreview } from './preview/QueryPreview';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'builder', label: 'Builder' },
  { id: 'preview', label: 'Preview' },
  { id: 'json', label: 'JSON' },
] as const;

export function QueryBuilder() {
  const { root, activeTab, setActiveTab } = useQueryStore();

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
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-64">
        {activeTab === 'builder' && (
          <ConditionGroup group={root} depth={0} />
        )}
        {activeTab === 'preview' && <QueryPreview />}
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
