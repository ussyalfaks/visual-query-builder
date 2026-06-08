import type { FieldSchema, Operator } from './types';

export const SCHEMA: FieldSchema[] = [
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'age', label: 'Age', type: 'number' },
  { key: 'status', label: 'Status', type: 'enum', values: ['active', 'inactive', 'pending', 'banned'] },
  { key: 'country', label: 'Country', type: 'enum', values: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Ethiopia'] },
  { key: 'purchases', label: 'Purchases', type: 'number' },
  { key: 'email', label: 'Email', type: 'string' },
  { key: 'score', label: 'Score', type: 'number' },
  { key: 'plan', label: 'Plan', type: 'enum', values: ['free', 'pro', 'enterprise'] },
  { key: 'createdAt', label: 'Created At', type: 'date' },
];

export const OPERATORS_BY_TYPE: Record<string, Operator[]> = {
  string: ['equals', 'not equals', 'contains', 'starts with', 'ends with', 'regex'],
  number: ['equals', 'not equals', 'greater than', 'less than', 'between'],
  enum:   ['equals', 'not equals', 'in array', 'not in array'],
  date:   ['equals', 'before', 'after', 'between'],
  boolean: ['equals', 'not equals'],
};

export const OPERATOR_LABELS: Record<Operator, string> = {
  'equals': '=',
  'not equals': '≠',
  'contains': 'contains',
  'starts with': 'starts with',
  'ends with': 'ends with',
  'greater than': '>',
  'less than': '<',
  'between': 'between',
  'in array': 'in',
  'not in array': 'not in',
  'before': 'before',
  'after': 'after',
  'regex': 'matches regex',
};

export const NO_VALUE_OPERATORS: Operator[] = [];
