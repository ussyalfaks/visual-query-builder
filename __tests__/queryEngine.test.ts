import { describe, it, expect } from 'vitest';
import { evaluateGroup, executeQuery } from '@/lib/queryEngine';
import type { QueryGroup, FieldSchema } from '@/lib/types';

const schema: FieldSchema[] = [
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'age', label: 'Age', type: 'number' },
  { key: 'status', label: 'Status', type: 'enum', values: ['active', 'inactive', 'pending'] },
  { key: 'country', label: 'Country', type: 'enum', values: ['Nigeria', 'Ghana'] },
  { key: 'createdAt', label: 'Created At', type: 'date' },
];

const rows = [
  { name: 'Alice', age: 30, status: 'active', country: 'Nigeria', createdAt: '2024-01-15' },
  { name: 'Bob', age: 17, status: 'active', country: 'Ghana', createdAt: '2023-06-20' },
  { name: 'Carol', age: 25, status: 'inactive', country: 'Nigeria', createdAt: '2022-03-01' },
  { name: 'David', age: 42, status: 'pending', country: 'Ghana', createdAt: '2021-11-10' },
];

function makeGroup(overrides: Partial<QueryGroup> = {}): QueryGroup {
  return { id: 'g1', logic: 'AND', rules: [], groups: [], ...overrides };
}

describe('evaluateGroup', () => {
  it('empty group passes all rows', () => {
    const g = makeGroup();
    rows.forEach(row => expect(evaluateGroup(row, g, schema)).toBe(true));
  });

  it('equals operator', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'status', operator: 'equals', value: 'active' }] });
    expect(evaluateGroup(rows[0], g, schema)).toBe(true);
    expect(evaluateGroup(rows[2], g, schema)).toBe(false);
  });

  it('not equals operator', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'country', operator: 'not equals', value: 'Nigeria' }] });
    expect(evaluateGroup(rows[0], g, schema)).toBe(false);
    expect(evaluateGroup(rows[1], g, schema)).toBe(true);
  });

  it('contains operator (case-insensitive)', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'name', operator: 'contains', value: 'ali' }] });
    expect(evaluateGroup(rows[0], g, schema)).toBe(true);  // "Alice"
    expect(evaluateGroup(rows[1], g, schema)).toBe(false);
  });

  it('starts with operator', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'name', operator: 'starts with', value: 'A' }] });
    expect(evaluateGroup(rows[0], g, schema)).toBe(true);  // Alice
    expect(evaluateGroup(rows[1], g, schema)).toBe(false); // Bob
  });

  it('ends with operator', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'name', operator: 'ends with', value: 'ol' }] });
    expect(evaluateGroup(rows[0], g, schema)).toBe(false);
    expect(evaluateGroup(rows[2], g, schema)).toBe(true);  // Carol
  });

  it('greater than operator', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'age', operator: 'greater than', value: '18' }] });
    expect(evaluateGroup(rows[0], g, schema)).toBe(true);  // 30
    expect(evaluateGroup(rows[1], g, schema)).toBe(false); // 17
  });

  it('less than operator', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'age', operator: 'less than', value: '18' }] });
    expect(evaluateGroup(rows[1], g, schema)).toBe(true);  // 17
    expect(evaluateGroup(rows[0], g, schema)).toBe(false); // 30
  });

  it('between operator for numbers', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'age', operator: 'between', value: '20,35' }] });
    expect(evaluateGroup(rows[0], g, schema)).toBe(true);  // 30
    expect(evaluateGroup(rows[1], g, schema)).toBe(false); // 17
    expect(evaluateGroup(rows[2], g, schema)).toBe(true);  // 25
    expect(evaluateGroup(rows[3], g, schema)).toBe(false); // 42
  });

  it('in array operator', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'status', operator: 'in array', value: 'active, pending' }] });
    expect(evaluateGroup(rows[0], g, schema)).toBe(true);  // active
    expect(evaluateGroup(rows[2], g, schema)).toBe(false); // inactive
    expect(evaluateGroup(rows[3], g, schema)).toBe(true);  // pending
  });

  it('not in array operator', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'status', operator: 'not in array', value: 'active' }] });
    expect(evaluateGroup(rows[0], g, schema)).toBe(false);
    expect(evaluateGroup(rows[2], g, schema)).toBe(true);
  });

  it('is empty operator', () => {
    const rowWithEmpty = { ...rows[0], name: '' };
    const g = makeGroup({ rules: [{ id: 'r1', field: 'name', operator: 'is empty', value: '' }] });
    expect(evaluateGroup(rowWithEmpty, g, schema)).toBe(true);
    expect(evaluateGroup(rows[0], g, schema)).toBe(false);
  });

  it('regex operator', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'name', operator: 'regex', value: '^[AB]' }] });
    expect(evaluateGroup(rows[0], g, schema)).toBe(true);  // Alice
    expect(evaluateGroup(rows[1], g, schema)).toBe(true);  // Bob
    expect(evaluateGroup(rows[2], g, schema)).toBe(false); // Carol
  });

  it('before / after date operators', () => {
    const gBefore = makeGroup({ rules: [{ id: 'r1', field: 'createdAt', operator: 'before', value: '2023-01-01' }] });
    expect(evaluateGroup(rows[2], gBefore, schema)).toBe(true);  // 2022-03-01 < 2023-01-01
    expect(evaluateGroup(rows[0], gBefore, schema)).toBe(false); // 2024-01-15 not before 2023-01-01

    const gAfter = makeGroup({ rules: [{ id: 'r2', field: 'createdAt', operator: 'after', value: '2023-01-01' }] });
    expect(evaluateGroup(rows[0], gAfter, schema)).toBe(true);  // 2024-01-15 > 2023-01-01
    expect(evaluateGroup(rows[2], gAfter, schema)).toBe(false); // 2022-03-01 not after 2023-01-01
  });

  describe('AND logic', () => {
    it('all conditions must pass', () => {
      const g = makeGroup({
        logic: 'AND',
        rules: [
          { id: 'r1', field: 'status', operator: 'equals', value: 'active' },
          { id: 'r2', field: 'age', operator: 'greater than', value: '18' },
        ],
      });
      expect(evaluateGroup(rows[0], g, schema)).toBe(true);  // active, 30 ✓
      expect(evaluateGroup(rows[1], g, schema)).toBe(false); // active, 17 ✗
      expect(evaluateGroup(rows[2], g, schema)).toBe(false); // inactive, 25 ✗
    });
  });

  describe('OR logic', () => {
    it('at least one condition must pass', () => {
      const g = makeGroup({
        logic: 'OR',
        rules: [
          { id: 'r1', field: 'status', operator: 'equals', value: 'inactive' },
          { id: 'r2', field: 'age', operator: 'less than', value: '18' },
        ],
      });
      expect(evaluateGroup(rows[1], g, schema)).toBe(true);  // age<18 ✓
      expect(evaluateGroup(rows[2], g, schema)).toBe(true);  // inactive ✓
      expect(evaluateGroup(rows[0], g, schema)).toBe(false); // active, 30 ✗
    });
  });

  describe('nested groups (recursive)', () => {
    it('evaluates nested AND inside OR correctly', () => {
      const g = makeGroup({
        logic: 'OR',
        rules: [{ id: 'r1', field: 'country', operator: 'equals', value: 'Ghana' }],
        groups: [{
          id: 'g2', logic: 'AND',
          rules: [
            { id: 'r2', field: 'status', operator: 'equals', value: 'active' },
            { id: 'r3', field: 'age', operator: 'greater than', value: '28' },
          ],
          groups: [],
        }],
      });
      // Alice: Nigeria, active, 30 → Ghana? no. (active AND 30>28)? yes → OR = true
      expect(evaluateGroup(rows[0], g, schema)).toBe(true);
      // Bob: Ghana, active, 17 → Ghana? yes → OR = true
      expect(evaluateGroup(rows[1], g, schema)).toBe(true);
      // Carol: Nigeria, inactive, 25 → Ghana? no. (inactive AND 25>28)? no → false
      expect(evaluateGroup(rows[2], g, schema)).toBe(false);
    });

    it('handles deeply nested groups (3 levels)', () => {
      const g = makeGroup({
        logic: 'AND',
        rules: [{ id: 'r1', field: 'status', operator: 'equals', value: 'active' }],
        groups: [{
          id: 'g2', logic: 'OR',
          rules: [{ id: 'r2', field: 'country', operator: 'equals', value: 'Nigeria' }],
          groups: [{
            id: 'g3', logic: 'AND',
            rules: [
              { id: 'r3', field: 'age', operator: 'greater than', value: '25' },
              { id: 'r4', field: 'name', operator: 'contains', value: 'ob' },
            ],
            groups: [],
          }],
        }],
      });
      // Alice: active AND (Nigeria OR (age>25 AND contains 'ob'))
      // = active AND (true OR (30>25 AND false)) = active AND true = true
      expect(evaluateGroup(rows[0], g, schema)).toBe(true);
      // Bob: active AND (Ghana OR (17>25 AND 'Bob' contains 'ob'))
      // = active AND (false OR (false AND true)) = active AND false = false
      expect(evaluateGroup(rows[1], g, schema)).toBe(false);
    });
  });
});

describe('executeQuery', () => {
  it('returns all rows when group is empty', () => {
    const g = makeGroup();
    expect(executeQuery(rows, g, schema)).toHaveLength(rows.length);
  });

  it('filters correctly on single rule', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'country', operator: 'equals', value: 'Nigeria' }] });
    const res = executeQuery(rows, g, schema);
    expect(res).toHaveLength(2);
    expect(res.every(r => r.country === 'Nigeria')).toBe(true);
  });

  it('returns empty array when nothing matches', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'name', operator: 'equals', value: 'Nobody' }] });
    expect(executeQuery(rows, g, schema)).toHaveLength(0);
  });
});
