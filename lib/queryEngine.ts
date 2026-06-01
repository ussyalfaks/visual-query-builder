import type { QueryGroup, QueryRule, FieldSchema } from './types';

function applyRule(row: Record<string, unknown>, rule: QueryRule, schema: FieldSchema[]): boolean {
  const fieldSchema = schema.find(f => f.key === rule.field);
  if (!fieldSchema) return false;

  const rawValue = row[rule.field];
  const { operator, value } = rule;
  const strField = String(rawValue ?? '').toLowerCase();
  const strVal = value.toLowerCase();

  switch (operator) {
    case 'is empty':
      return rawValue === null || rawValue === undefined || rawValue === '';
    case 'is not empty':
      return rawValue !== null && rawValue !== undefined && rawValue !== '';
    case 'equals':
      return String(rawValue) === value;
    case 'not equals':
      return String(rawValue) !== value;
    case 'contains':
      return strField.includes(strVal);
    case 'starts with':
      return strField.startsWith(strVal);
    case 'ends with':
      return strField.endsWith(strVal);
    case 'greater than':
      return Number(rawValue) > Number(value);
    case 'less than':
      return Number(rawValue) < Number(value);
    case 'before':
      return new Date(String(rawValue)) < new Date(value);
    case 'after':
      return new Date(String(rawValue)) > new Date(value);
    case 'between': {
      const [a, b] = value.split(',').map(s => s.trim());
      if (fieldSchema.type === 'number') {
        return Number(rawValue) >= Number(a) && Number(rawValue) <= Number(b);
      }
      if (fieldSchema.type === 'date') {
        const d = new Date(String(rawValue));
        return d >= new Date(a) && d <= new Date(b);
      }
      return false;
    }
    case 'in array': {
      const arr = value.split(',').map(s => s.trim());
      return arr.includes(String(rawValue));
    }
    case 'not in array': {
      const arr = value.split(',').map(s => s.trim());
      return !arr.includes(String(rawValue));
    }
    case 'regex': {
      try {
        return new RegExp(value, 'i').test(String(rawValue ?? ''));
      } catch {
        return false;
      }
    }
    default:
      return false;
  }
}

// Recursive: evaluates a group tree against a single data row
export function evaluateGroup(
  row: Record<string, unknown>,
  group: QueryGroup,
  schema: FieldSchema[]
): boolean {
  const results: boolean[] = [
    ...group.rules.map(rule => applyRule(row, rule, schema)),
    ...group.groups.map(subGroup => evaluateGroup(row, subGroup, schema)), // recursive
  ];

  if (results.length === 0) return true;

  return group.logic === 'AND'
    ? results.every(Boolean)
    : results.some(Boolean);
}

export function executeQuery(
  data: Record<string, unknown>[],
  root: QueryGroup,
  schema: FieldSchema[]
): Record<string, unknown>[] {
  return data.filter(row => evaluateGroup(row, root, schema));
}
