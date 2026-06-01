export type FieldType = 'string' | 'number' | 'enum' | 'date' | 'boolean';

export type LogicOperator = 'AND' | 'OR';

export type Operator =
  | 'equals'
  | 'not equals'
  | 'contains'
  | 'starts with'
  | 'ends with'
  | 'greater than'
  | 'less than'
  | 'between'
  | 'in array'
  | 'not in array'
  | 'is empty'
  | 'is not empty'
  | 'before'
  | 'after'
  | 'regex';

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  values?: string[];
}

export interface QueryRule {
  id: string;
  field: string;
  operator: Operator;
  value: string;
}

export interface QueryGroup {
  id: string;
  logic: LogicOperator;
  rules: QueryRule[];
  groups: QueryGroup[];
}

export interface Preset {
  id: string;
  name: string;
  query: QueryGroup;
  createdAt: string;
}

export interface QueryResult {
  rows: Record<string, unknown>[];
  total: number;
  matched: number;
  duration: number;
}
