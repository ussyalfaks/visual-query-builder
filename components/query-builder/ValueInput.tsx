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
      const parts = rule.value ? rule.value.split(',').map(s => s.trim()) : [];
      const start = parts[0] ?? '';
      const end = parts[1] ?? '';
      return (
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <input
            type="date"
            className={cn(base, 'flex-1 min-w-0')}
            value={start}
            onChange={e => onChange([e.target.value, end].join(','))}
          />
          <span className="text-xs text-subtle shrink-0">to</span>
          <input
            type="date"
            className={cn(base, 'flex-1 min-w-0')}
            value={end}
            onChange={e => onChange([start, e.target.value].join(','))}
          />
        </div>
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
      const parts = rule.value ? rule.value.split(',').map(s => s.trim()) : [];
      const from = parts[0] ?? '';
      const to = parts[1] ?? '';
      return (
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <input
            type="number"
            className={cn(base, 'w-24')}
            placeholder="min"
            value={from}
            onChange={e => onChange([e.target.value, to].join(','))}
          />
          <span className="text-xs text-subtle shrink-0">to</span>
          <input
            type="number"
            className={cn(base, 'w-24')}
            placeholder="max"
            value={to}
            onChange={e => onChange([from, e.target.value].join(','))}
          />
        </div>
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
