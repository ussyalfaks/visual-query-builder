'use client';
import { memo } from 'react';
import type { QueryRule, FieldSchema } from '@/lib/types';
import { NO_VALUE_OPERATORS } from '@/lib/schema';
import { cn } from '@/lib/utils';

interface Props {
  rule: QueryRule;
  field: FieldSchema;
  error?: string;
  onChange: (value: string) => void;
}

export const ValueInput = memo(function ValueInput({ rule, field, error, onChange }: Props) {
  const base = cn(
    'h-8 rounded border bg-background px-2.5 text-xs font-mono text-accent-text focus:outline-none focus:ring-1 transition-colors',
    error
      ? 'border-destructive/60 focus:ring-destructive'
      : 'border-border focus:ring-accent focus:border-accent'
  );

  if (NO_VALUE_OPERATORS.includes(rule.operator)) {
    return <span className="text-xs text-subtle italic px-2 self-center">no value</span>;
  }

  if (field.type === 'enum') {
    if (['in array', 'not in array'].includes(rule.operator)) {
      return (
        <input
          type="text"
          className={cn(base, 'flex-1 min-w-0')}
          placeholder="val1, val2, val3"
          value={rule.value}
          onChange={e => onChange(e.target.value)}
        />
      );
    }
    return (
      <select
        className={cn(base, 'flex-1 min-w-0 text-accent-text')}
        value={rule.value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {field.values?.map(v => (
          <option key={v} value={v}>{v}</option>
        ))}
      </select>
    );
  }

  if (field.type === 'date') {
    if (rule.operator === 'between') {
      return (
        <input
          type="text"
          className={cn(base, 'flex-1 min-w-0')}
          placeholder="2024-01-01, 2024-12-31"
          value={rule.value}
          onChange={e => onChange(e.target.value)}
        />
      );
    }
    return (
      <input
        type="date"
        className={cn(base, 'flex-1 min-w-0')}
        value={rule.value}
        onChange={e => onChange(e.target.value)}
      />
    );
  }

  if (field.type === 'number') {
    if (rule.operator === 'between') {
      return (
        <input
          type="text"
          className={cn(base, 'flex-1 min-w-0')}
          placeholder="18, 65"
          value={rule.value}
          onChange={e => onChange(e.target.value)}
        />
      );
    }
    return (
      <input
        type="number"
        className={cn(base, 'w-28')}
        placeholder="0"
        value={rule.value}
        onChange={e => onChange(e.target.value)}
      />
    );
  }

  return (
    <input
      type="text"
      className={cn(base, 'flex-1 min-w-0')}
      placeholder="Enter value..."
      value={rule.value}
      onChange={e => onChange(e.target.value)}
    />
  );
});
