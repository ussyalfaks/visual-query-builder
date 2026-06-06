'use client';
import { memo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, AlertCircle } from 'lucide-react';
import type { QueryRule } from '@/lib/types';
import { OPERATORS_BY_TYPE, OPERATOR_LABELS } from '@/lib/schema';
import { useQueryStore } from '@/store/queryStore';
import { ValueInput } from './ValueInput';
import { cn } from '@/lib/utils';

interface Props {
  rule: QueryRule;
  groupId: string;
}

export const ConditionRule = memo(function ConditionRule({ rule, groupId }: Props) {
  const { schema, errors, updateRule, removeRule } = useQueryStore();
  const error = errors[rule.id];
  const field = schema.find(f => f.key === rule.field)!;
  const availableOps = OPERATORS_BY_TYPE[field?.type ?? 'string'] ?? [];

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: rule.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleFieldChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateRule(groupId, rule.id, { field: e.target.value });
  }, [groupId, rule.id, updateRule]);

  const handleOpChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateRule(groupId, rule.id, { operator: e.target.value as QueryRule['operator'] });
  }, [groupId, rule.id, updateRule]);

  const handleValueChange = useCallback((value: string) => {
    updateRule(groupId, rule.id, { value });
  }, [groupId, rule.id, updateRule]);

  const handleRemove = useCallback(() => removeRule(groupId, rule.id), [groupId, rule.id, removeRule]);

  const selectCls = 'h-8 rounded border border-border bg-background px-2 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent shrink-0 transition-colors';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md border bg-surface-raised p-2 group transition-all',
        isDragging ? 'opacity-50 shadow-lg z-50' : 'opacity-100',
        error ? 'border-destructive/50' : 'border-border'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-subtle hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <select className={cn(selectCls, 'w-28')} value={rule.field} onChange={handleFieldChange}>
        {schema.map(f => (
          <option key={f.key} value={f.key}>{f.label}</option>
        ))}
      </select>

      <select className={cn(selectCls, 'w-32')} value={rule.operator} onChange={handleOpChange}>
        {availableOps.map(op => (
          <option key={op} value={op}>{OPERATOR_LABELS[op] || op}</option>
        ))}
      </select>

      <div className="flex-1 min-w-0 flex items-center gap-1">
        <ValueInput rule={rule} field={field} error={error} onChange={handleValueChange} />
      </div>

      {error && (
        <div className="group/err relative shrink-0">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <div className="absolute right-0 bottom-6 z-50 bg-destructive text-destructive-foreground text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover/err:opacity-100 transition-opacity pointer-events-none">
            {error}
          </div>
        </div>
      )}

      <button
        onClick={handleRemove}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-subtle hover:text-destructive transition-all"
        aria-label="Remove condition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
});
