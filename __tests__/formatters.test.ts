import { describe, it, expect } from 'vitest';
import { toSQL, toMongo } from '@/lib/formatters';
import type { QueryGroup, FieldSchema } from '@/lib/types';

const schema: FieldSchema[] = [
  { key: 'name', label: 'Name', type: 'string' },
  { key: 'age', label: 'Age', type: 'number' },
  { key: 'status', label: 'Status', type: 'enum', values: ['active'] },
];

function makeGroup(overrides: Partial<QueryGroup> = {}): QueryGroup {
  return { id: 'root', logic: 'AND', rules: [], groups: [], ...overrides };
}

describe('toSQL', () => {
  it('generates SELECT * for empty group', () => {
    const sql = toSQL(makeGroup(), schema);
    expect(sql).toContain('SELECT *');
    expect(sql).not.toContain('WHERE');
  });

  it('generates equals clause with string quoting', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'name', operator: 'equals', value: 'Alice' }] });
    expect(toSQL(g, schema)).toContain("name = 'Alice'");
  });

  it('generates numeric value without quotes', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'age', operator: 'greater than', value: '18' }] });
    expect(toSQL(g, schema)).toContain('age > 18');
    expect(toSQL(g, schema)).not.toContain("'18'");
  });

  it('generates LIKE for contains', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'name', operator: 'contains', value: 'ali' }] });
    expect(toSQL(g, schema)).toContain("LIKE '%ali%'");
  });

  it('generates BETWEEN correctly', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'age', operator: 'between', value: '18, 65' }] });
    expect(toSQL(g, schema)).toContain('BETWEEN 18 AND 65');
  });

  it('generates IN (...) for in array', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'status', operator: 'in array', value: 'active, inactive' }] });
    expect(toSQL(g, schema)).toContain("IN ('active', 'inactive')");
  });

  it('generates IS NULL for is empty', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'name', operator: 'is empty', value: '' }] });
    expect(toSQL(g, schema)).toContain('IS NULL');
  });

  it('wraps nested groups in parentheses', () => {
    const g = makeGroup({
      rules: [{ id: 'r1', field: 'status', operator: 'equals', value: 'active' }],
      groups: [makeGroup({
        id: 'g2',
        rules: [{ id: 'r2', field: 'age', operator: 'greater than', value: '18' }],
      })],
    });
    const sql = toSQL(g, schema);
    expect(sql).toContain('(');
    expect(sql).toContain(')');
  });

  it('uses OR logic', () => {
    const g = makeGroup({
      logic: 'OR',
      rules: [
        { id: 'r1', field: 'status', operator: 'equals', value: 'active' },
        { id: 'r2', field: 'age', operator: 'greater than', value: '30' },
      ],
    });
    expect(toSQL(g, schema)).toContain('OR');
    expect(toSQL(g, schema)).not.toContain('AND');
  });

  it('escapes single quotes in string values', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'name', operator: 'equals', value: "O'Brien" }] });
    expect(toSQL(g, schema)).toContain("O''Brien");
  });
});

describe('toMongo', () => {
  it('generates $gt for greater than', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'age', operator: 'greater than', value: '18' }] });
    const result = JSON.parse(toMongo(g, schema));
    expect(result.age.$gt).toBe(18);
  });

  it('generates $regex for contains', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'name', operator: 'contains', value: 'ali' }] });
    const result = JSON.parse(toMongo(g, schema));
    expect(result.name.$regex).toBe('ali');
  });

  it('wraps multiple rules in $and', () => {
    const g = makeGroup({
      logic: 'AND',
      rules: [
        { id: 'r1', field: 'status', operator: 'equals', value: 'active' },
        { id: 'r2', field: 'age', operator: 'greater than', value: '18' },
      ],
    });
    const result = JSON.parse(toMongo(g, schema));
    expect(result.$and).toBeDefined();
    expect(result.$and).toHaveLength(2);
  });

  it('wraps OR groups in $or', () => {
    const g = makeGroup({
      logic: 'OR',
      rules: [
        { id: 'r1', field: 'status', operator: 'equals', value: 'active' },
        { id: 'r2', field: 'age', operator: 'greater than', value: '18' },
      ],
    });
    const result = JSON.parse(toMongo(g, schema));
    expect(result.$or).toBeDefined();
  });

  it('generates $in for in array', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'status', operator: 'in array', value: 'active, inactive' }] });
    const result = JSON.parse(toMongo(g, schema));
    expect(result.status.$in).toContain('active');
    expect(result.status.$in).toContain('inactive');
  });

  it('generates $gte and $lte for between', () => {
    const g = makeGroup({ rules: [{ id: 'r1', field: 'age', operator: 'between', value: '18, 65' }] });
    const result = JSON.parse(toMongo(g, schema));
    expect(result.age.$gte).toBe(18);
    expect(result.age.$lte).toBe(65);
  });
});
