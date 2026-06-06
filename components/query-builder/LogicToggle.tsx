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
