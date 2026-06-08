import type { QueryGroup, QueryRule, FieldSchema } from './types';

function escapeStr(val: string): string {
  return (val ?? '').replace(/'/g, "''");
}

function fmtSQLVal(val: string, type: string): string {
  if (type === 'number') return val;
  return `'${escapeStr(val)}'`;
}

function ruleToSQL(rule: QueryRule, schema: FieldSchema[]): string {
  const field = schema.find(f => f.key === rule.field);
  if (!field) return '/* unknown field */';
  const col = rule.field;
  const { operator, value } = rule;
  const fmt = (v: string) => fmtSQLVal(v, field.type);

  switch (operator) {
    case 'equals':       return `${col} = ${fmt(value)}`;
    case 'not equals':   return `${col} != ${fmt(value)}`;
    case 'contains':     return `${col} LIKE ${fmt('%' + value + '%')}`;
    case 'starts with':  return `${col} LIKE ${fmt(value + '%')}`;
    case 'ends with':    return `${col} LIKE ${fmt('%' + value)}`;
    case 'greater than': return `${col} > ${fmt(value)}`;
    case 'less than':    return `${col} < ${fmt(value)}`;
    case 'before':       return `${col} < ${fmt(value)}`;
    case 'after':        return `${col} > ${fmt(value)}`;
    case 'between': {
      const [a, b] = value.split(',').map(s => s.trim());
      if (!a || !b) return `${col} BETWEEN ? AND ?`;
      return `${col} BETWEEN ${fmt(a)} AND ${fmt(b)}`;
    }
    case 'in array': {
      const parts = value.split(',').map(s => fmt(s.trim()));
      return `${col} IN (${parts.join(', ')})`;
    }
    case 'not in array': {
      const parts = value.split(',').map(s => fmt(s.trim()));
      return `${col} NOT IN (${parts.join(', ')})`;
    }
    case 'regex': return `${col} REGEXP ${fmt(value)}`;
    default: return `/* unknown operator */`;
  }
}

function groupToSQL(group: QueryGroup, schema: FieldSchema[], depth = 0): string {
  const indent = '  '.repeat(depth + 1);
  const joiner = `\n${indent}${group.logic} `;
  const parts: string[] = [
    ...group.rules.map(r => `${indent}${ruleToSQL(r, schema)}`),
    ...group.groups.map(g => {
      const inner = groupToSQL(g, schema, depth + 1);
      return `${indent}(\n${inner}\n${indent})`;
    }),
  ];
  return parts.join(joiner);
}

export function toSQL(root: QueryGroup, schema: FieldSchema[], table = 'users'): string {
  if (root.rules.length === 0 && root.groups.length === 0) {
    return `SELECT * FROM ${table};`;
  }
  return `SELECT *\nFROM ${table}\nWHERE\n${groupToSQL(root, schema)};`;
}

// ---- MongoDB formatter ----

function ruleToMongo(rule: QueryRule, schema: FieldSchema[]): Record<string, unknown> {
  const field = schema.find(f => f.key === rule.field);
  if (!field) return {};
  const { operator, value, field: col } = rule;
  const numVal = Number(value);

  switch (operator) {
    case 'equals':       return { [col]: field.type === 'number' ? numVal : value };
    case 'not equals':   return { [col]: { $ne: field.type === 'number' ? numVal : value } };
    case 'contains':     return { [col]: { $regex: value, $options: 'i' } };
    case 'starts with':  return { [col]: { $regex: `^${value}`, $options: 'i' } };
    case 'ends with':    return { [col]: { $regex: `${value}$`, $options: 'i' } };
    case 'greater than': return { [col]: { $gt: numVal } };
    case 'less than':    return { [col]: { $lt: numVal } };
    case 'before':       return { [col]: { $lt: value } };
    case 'after':        return { [col]: { $gt: value } };
    case 'between': {
      const [a, b] = value.split(',').map(s => s.trim());
      if (!a || !b) return {};
      return { [col]: { $gte: field.type === 'number' ? Number(a) : a, $lte: field.type === 'number' ? Number(b) : b } };
    }
    case 'in array':     return { [col]: { $in: value.split(',').map(s => s.trim()) } };
    case 'not in array': return { [col]: { $nin: value.split(',').map(s => s.trim()) } };
    case 'regex':        return { [col]: { $regex: value, $options: 'i' } };
    default:             return {};
  }
}

function groupToMongo(group: QueryGroup, schema: FieldSchema[]): Record<string, unknown> {
  const conditions: Record<string, unknown>[] = [
    ...group.rules.map(r => ruleToMongo(r, schema)),
    ...group.groups.map(g => groupToMongo(g, schema)),
  ];
  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  return { [group.logic === 'AND' ? '$and' : '$or']: conditions };
}

export function toMongo(root: QueryGroup, schema: FieldSchema[]): string {
  return JSON.stringify(groupToMongo(root, schema), null, 2);
}
