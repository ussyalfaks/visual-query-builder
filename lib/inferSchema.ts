import type { FieldSchema, FieldType } from './types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/;

function inferType(values: unknown[]): FieldType {
  const nonNull = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNull.length === 0) return 'string';

  if (nonNull.every(v => typeof v === 'boolean')) return 'boolean';
  if (nonNull.every(v => typeof v === 'number')) return 'number';
  if (nonNull.every(v => typeof v === 'string' && DATE_RE.test(v as string))) return 'date';

  if (nonNull.every(v => typeof v === 'string')) {
    const unique = new Set(nonNull as string[]);
    if (unique.size <= 20 && unique.size / nonNull.length < 0.5) return 'enum';
    return 'string';
  }

  return 'string';
}

function toLabel(key: string): string {
  return key
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function inferSchema(records: Record<string, unknown>[]): FieldSchema[] {
  if (records.length === 0) return [];

  const sample = records.slice(0, 200);
  const keys = Object.keys(sample[0]);

  return keys.map(key => {
    const values = sample.map(r => r[key]);
    const type = inferType(values);

    const field: FieldSchema = { key, label: toLabel(key), type };

    if (type === 'enum') {
      field.values = [...new Set(values.filter(v => v !== null && v !== undefined && v !== '') as string[])].sort();
    }

    return field;
  });
}
