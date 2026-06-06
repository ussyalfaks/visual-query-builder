import type { QueryGroup, QueryRule, FieldSchema } from './types';
import { NO_VALUE_OPERATORS } from './schema';

export function validateRule(rule: QueryRule, schema: FieldSchema[]): string | null {
  const field = schema.find(f => f.key === rule.field);
  if (!field) return 'Unknown field';

  if (NO_VALUE_OPERATORS.includes(rule.operator)) return null;

  if (!rule.value && !['in array', 'not in array', 'between'].includes(rule.operator)) {
    return 'Value is required';
  }

  if (field.type === 'number') {
    if (['contains', 'starts with', 'ends with', 'regex'].includes(rule.operator)) {
      return `"${rule.operator}" cannot be used with numeric fields`;
    }
    if (rule.operator === 'between') {
      const [a, b] = rule.value.split(',').map(s => s.trim());
      if (!a || !b) return null;
      if (isNaN(Number(a)) || isNaN(Number(b))) return 'Both values must be numbers';
      if (Number(a) >= Number(b)) return 'First value must be less than second';
    } else if (rule.value && isNaN(Number(rule.value))) {
      return 'Must be a number';
    }
  }

  if (field.type === 'date') {
    if (['contains', 'starts with', 'greater than', 'less than'].includes(rule.operator)) {
      return `"${rule.operator}" cannot be used with date fields`;
    }
    if (rule.operator === 'between') {
      const [a, b] = rule.value.split(',').map(s => s.trim());
      if (!a || !b) return null;
      if (isNaN(Date.parse(a)) || isNaN(Date.parse(b))) return 'Invalid date format';
      if (new Date(a) >= new Date(b)) return 'Start date must be before end date';
    } else if (rule.value && isNaN(Date.parse(rule.value))) {
      return 'Invalid date';
    }
  }

  if (field.type === 'enum') {
    if (['contains', 'starts with', 'ends with', 'greater than', 'less than', 'between', 'regex'].includes(rule.operator)) {
      return `"${rule.operator}" cannot be used with this field`;
    }
  }

  if (['in array', 'not in array'].includes(rule.operator)) {
    const parts = rule.value.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return 'Enter at least one value';
  }

  return null;
}

export function validateGroup(
  group: QueryGroup,
  schema: FieldSchema[],
  errors: Record<string, string> = {}
): Record<string, string> {
  // Flag non-root groups that have neither rules nor sub-groups
  if (group.id !== 'root' && group.rules.length === 0 && group.groups.length === 0) {
    errors[group.id] = 'Group must have at least one condition';
  }

  for (const rule of group.rules) {
    const error = validateRule(rule, schema);
    if (error) errors[rule.id] = error;
  }

  for (const subGroup of group.groups) {
    validateGroup(subGroup, schema, errors);
  }

  return errors;
}
