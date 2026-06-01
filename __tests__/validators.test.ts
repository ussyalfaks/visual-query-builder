import { describe, it, expect } from 'vitest';
import { validateRule, validateGroup } from '@/lib/validators';
import type { QueryRule, QueryGroup, FieldSchema } from '@/lib/types';

const schema: FieldSchema[] = [
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'age', label: 'Age', type: 'number' },
  { key: 'status', label: 'Status', type: 'enum', values: ['active', 'inactive'] },
  { key: 'createdAt', label: 'Created At', type: 'date' },
];

function rule(overrides: Partial<QueryRule> = {}): QueryRule {
  return { id: 'r1', field: 'name', operator: 'equals', value: 'test', ...overrides };
}

describe('validateRule', () => {
  it('returns null for valid string rule', () => {
    expect(validateRule(rule(), schema)).toBeNull();
  });

  it('requires a value', () => {
    expect(validateRule(rule({ value: '' }), schema)).toBeTruthy();
  });

  it('no value needed for is empty / is not empty', () => {
    expect(validateRule(rule({ operator: 'is empty', value: '' }), schema)).toBeNull();
    expect(validateRule(rule({ operator: 'is not empty', value: '' }), schema)).toBeNull();
  });

  it('rejects non-numeric value for number field', () => {
    const r = rule({ field: 'age', operator: 'equals', value: 'abc' });
    expect(validateRule(r, schema)).toBeTruthy();
  });

  it('accepts numeric string for number field', () => {
    const r = rule({ field: 'age', operator: 'equals', value: '25' });
    expect(validateRule(r, schema)).toBeNull();
  });

  it('rejects "contains" operator for number fields', () => {
    const r = rule({ field: 'age', operator: 'contains', value: '2' });
    expect(validateRule(r, schema)).toBeTruthy();
  });

  it('validates between requires two comma-separated values', () => {
    const bad = rule({ field: 'age', operator: 'between', value: '10' });
    expect(validateRule(bad, schema)).toBeTruthy();

    const good = rule({ field: 'age', operator: 'between', value: '10, 30' });
    expect(validateRule(good, schema)).toBeNull();
  });

  it('validates between range direction for numbers', () => {
    const r = rule({ field: 'age', operator: 'between', value: '30, 10' });
    expect(validateRule(r, schema)).toBeTruthy();
  });

  it('rejects invalid date', () => {
    const r = rule({ field: 'createdAt', operator: 'before', value: 'not-a-date' });
    expect(validateRule(r, schema)).toBeTruthy();
  });

  it('accepts valid date', () => {
    const r = rule({ field: 'createdAt', operator: 'before', value: '2024-01-01' });
    expect(validateRule(r, schema)).toBeNull();
  });

  it('rejects unsupported operator for enum', () => {
    const r = rule({ field: 'status', operator: 'contains', value: 'act' });
    expect(validateRule(r, schema)).toBeTruthy();
  });

  it('requires at least one value in in array', () => {
    const r = rule({ operator: 'in array', value: '' });
    expect(validateRule(r, schema)).toBeTruthy();
  });

  it('accepts comma-separated in array values', () => {
    const r = rule({ field: 'status', operator: 'in array', value: 'active, inactive' });
    expect(validateRule(r, schema)).toBeNull();
  });
});

describe('validateGroup', () => {
  it('returns no errors for valid group', () => {
    const g: QueryGroup = {
      id: 'g1', logic: 'AND',
      rules: [rule({ value: 'test' })],
      groups: [],
    };
    expect(Object.keys(validateGroup(g, schema))).toHaveLength(0);
  });

  it('collects errors from all rules', () => {
    const g: QueryGroup = {
      id: 'g1', logic: 'AND',
      rules: [
        rule({ id: 'r1', value: '' }),
        rule({ id: 'r2', field: 'age', operator: 'equals', value: 'bad' }),
      ],
      groups: [],
    };
    const errors = validateGroup(g, schema);
    expect(errors['r1']).toBeTruthy();
    expect(errors['r2']).toBeTruthy();
  });

  it('recursively validates nested groups', () => {
    const g: QueryGroup = {
      id: 'root', logic: 'AND',
      rules: [],
      groups: [{
        id: 'g2', logic: 'OR',
        rules: [rule({ id: 'nested-r1', value: '' })],
        groups: [],
      }],
    };
    const errors = validateGroup(g, schema);
    expect(errors['nested-r1']).toBeTruthy();
  });
});
