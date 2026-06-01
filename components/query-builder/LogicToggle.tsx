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
    <div className="flex rounded-md border border-input overflow-hidden shrink-0" role="group" aria-label="Logic operator">
      <button
        onClick={() => setLogic(groupId, 'AND')}
        className={cn(
          'px-3 py-1 text-xs font-semibold transition-colors focus:outline-none',
          logic === 'AND'
            ? 'bg-blue-500 text-white'
            : 'bg-background text-muted-foreground hover:bg-muted'
        )}
        aria-pressed={logic === 'AND'}
      >
        AND
      </button>
      <button
        onClick={() => setLogic(groupId, 'OR')}
        className={cn(
          'px-3 py-1 text-xs font-semibold transition-colors focus:outline-none',
          logic === 'OR'
            ? 'bg-amber-500 text-white'
            : 'bg-background text-muted-foreground hover:bg-muted'
        )}
        aria-pressed={logic === 'OR'}
      >
        OR
      </button>
    </div>
  );
});
