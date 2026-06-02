import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { QueryGroup, QueryRule, Preset, FieldSchema } from '@/lib/types';
import { SCHEMA, OPERATORS_BY_TYPE } from '@/lib/schema';
import { validateGroup } from '@/lib/validators';
import { generateId, deepClone } from '@/lib/utils';

export interface QueryStore {
  // State
  root: QueryGroup;
  schema: FieldSchema[];
  errors: Record<string, string>;
  history: QueryGroup[];
  results: Record<string, unknown>[] | null;
  isRunning: boolean;
  collapsed: Set<string>;
  presets: Preset[];
  activeFormat: 'sql' | 'mongo';
  activeTab: 'preview' | 'results' | 'history' | 'json';

  // Group actions
  setLogic: (groupId: string, logic: 'AND' | 'OR') => void;
  addRule: (groupId: string) => void;
  updateRule: (groupId: string, ruleId: string, patch: Partial<QueryRule>) => void;
  removeRule: (groupId: string, ruleId: string) => void;
  addGroup: (parentId: string) => void;
  removeGroup: (groupId: string) => void;
  reorderRules: (groupId: string, fromIndex: number, toIndex: number) => void;
  reorderGroups: (parentId: string, fromIndex: number, toIndex: number) => void;

  // UI actions
  toggleCollapse: (groupId: string) => void;
  setActiveTab: (tab: QueryStore['activeTab']) => void;
  setActiveFormat: (fmt: 'sql' | 'mongo') => void;

  // Query actions
  runQuery: (data: Record<string, unknown>[]) => Promise<void>;
  setResults: (results: Record<string, unknown>[] | null) => void;

  // History
  undo: () => void;
  snapshot: () => void;

  // Presets
  loadPreset: (query: QueryGroup) => void;
  savePreset: (name: string) => void;
  deletePreset: (id: string) => void;

  // Import/export
  importQuery: (jsonStr: string) => void;
  resetQuery: () => void;
}

function makeDefaultRule(schema: FieldSchema[]): QueryRule {
  return {
    id: generateId(),
    field: schema[0].key,
    operator: 'equals',
    value: '',
  };
}

function makeDefaultGroup(): QueryGroup {
  return {
    id: generateId(),
    logic: 'AND',
    rules: [],
    groups: [],
  };
}

function makeRootGroup(schema: FieldSchema[]): QueryGroup {
  return {
    id: 'root',
    logic: 'AND',
    rules: [makeDefaultRule(schema)],
    groups: [],
  };
}

// Recursive find & mutate in immer draft
function findGroup(node: QueryGroup, id: string): QueryGroup | null {
  if (node.id === id) return node;
  for (const g of node.groups) {
    const found = findGroup(g, id);
    if (found) return found;
  }
  return null;
}

function removeGroupById(node: QueryGroup, id: string): void {
  node.groups = node.groups.filter(g => g.id !== id);
  node.groups.forEach(g => removeGroupById(g, id));
}

export const useQueryStore = create<QueryStore>()(
  immer((set, get) => ({
    root: makeRootGroup(SCHEMA),
    schema: SCHEMA,
    errors: {},
    history: [],
    results: null,
    isRunning: false,
    collapsed: new Set<string>(),
    presets: [
      {
        id: 'p1',
        name: 'Active Nigerian adults',
        createdAt: new Date().toISOString(),
        query: {
          id: 'p1root', logic: 'AND',
          rules: [
            { id: 'p1r1', field: 'country', operator: 'equals', value: 'Nigeria' },
            { id: 'p1r2', field: 'age', operator: 'greater than', value: '18' },
            { id: 'p1r3', field: 'status', operator: 'equals', value: 'active' },
          ],
          groups: [],
        },
      },
      {
        id: 'p2',
        name: 'High-value enterprise buyers',
        createdAt: new Date().toISOString(),
        query: {
          id: 'p2root', logic: 'AND',
          rules: [{ id: 'p2r1', field: 'plan', operator: 'equals', value: 'enterprise' }],
          groups: [{
            id: 'p2g1', logic: 'OR',
            rules: [
              { id: 'p2r2', field: 'purchases', operator: 'greater than', value: '50' },
              { id: 'p2r3', field: 'score', operator: 'greater than', value: '90' },
            ],
            groups: [],
          }],
        },
      },
    ],
    activeFormat: 'sql',
    activeTab: 'preview',

    snapshot: () => {
      set(state => {
        state.history.push(deepClone(state.root));
        if (state.history.length > 30) state.history.shift();
      });
    },

    setLogic: (groupId, logic) => {
      get().snapshot();
      set(state => {
        const g = findGroup(state.root, groupId);
        if (g) g.logic = logic;
      });
    },

    addRule: (groupId) => {
      get().snapshot();
      set(state => {
        const g = findGroup(state.root, groupId);
        if (g) g.rules.push(makeDefaultRule(state.schema));
      });
    },

    updateRule: (groupId, ruleId, patch) => {
      set(state => {
        const g = findGroup(state.root, groupId);
        if (!g) return;
        const r = g.rules.find(r => r.id === ruleId);
        if (!r) return;
        Object.assign(r, patch);
        // Reset value when field changes
        if (patch.field) {
          r.value = '';
          const fieldSchema = state.schema.find(f => f.key === patch.field);
          if (fieldSchema) {
            const validOps = OPERATORS_BY_TYPE[fieldSchema.type] || [];
            if (!validOps.includes(r.operator)) r.operator = validOps[0];
          }
        }
        state.errors = validateGroup(state.root, state.schema);
      });
    },

    removeRule: (groupId, ruleId) => {
      get().snapshot();
      set(state => {
        const g = findGroup(state.root, groupId);
        if (g) g.rules = g.rules.filter(r => r.id !== ruleId);
        state.errors = validateGroup(state.root, state.schema);
      });
    },

    addGroup: (parentId) => {
      get().snapshot();
      set(state => {
        const g = findGroup(state.root, parentId);
        if (g) {
          const newGroup = makeDefaultGroup();
          newGroup.rules.push(makeDefaultRule(state.schema));
          g.groups.push(newGroup);
        }
        state.errors = validateGroup(state.root, state.schema);
      });
    },

    removeGroup: (groupId) => {
      get().snapshot();
      set(state => {
        removeGroupById(state.root, groupId);
        state.errors = validateGroup(state.root, state.schema);
      });
    },

    reorderRules: (groupId, fromIndex, toIndex) => {
      set(state => {
        const g = findGroup(state.root, groupId);
        if (!g) return;
        const [moved] = g.rules.splice(fromIndex, 1);
        g.rules.splice(toIndex, 0, moved);
      });
    },

    reorderGroups: (parentId, fromIndex, toIndex) => {
      set(state => {
        const g = findGroup(state.root, parentId);
        if (!g) return;
        const [moved] = g.groups.splice(fromIndex, 1);
        g.groups.splice(toIndex, 0, moved);
      });
    },

    toggleCollapse: (groupId) => {
      set(state => {
        const next = new Set(state.collapsed);
        if (next.has(groupId)) next.delete(groupId);
        else next.add(groupId);
        state.collapsed = next;
      });
    },

    setActiveTab: (tab) => set(state => { state.activeTab = tab; }),
    setActiveFormat: (fmt) => set(state => { state.activeFormat = fmt; }),
    setResults: (results) => set(state => { state.results = results; }),

    runQuery: async (data) => {
      const { root, schema } = get();
      const errors = validateGroup(root, schema);
      if (Object.keys(errors).length > 0) {
        set(state => { state.errors = errors; });
        return;
      }
      set(state => { state.isRunning = true; state.activeTab = 'results'; });
      await new Promise(r => setTimeout(r, 400));
      const { executeQuery } = await import('@/lib/queryEngine');
      const results = executeQuery(data, root, schema);
      set(state => { state.results = results; state.isRunning = false; });
    },

    undo: () => {
      set(state => {
        if (!state.history.length) return;
        state.root = state.history.pop()!;
        state.errors = {};
      });
    },

    loadPreset: (query) => {
      get().snapshot();
      set(state => {
        state.root = deepClone(query);
        state.root.id = 'root';
        state.errors = {};
        state.results = null;
      });
    },

    savePreset: (name) => {
      set(state => {
        state.presets.push({
          id: generateId(),
          name,
          query: deepClone(state.root),
          createdAt: new Date().toISOString(),
        });
      });
    },

    deletePreset: (id) => {
      set(state => { state.presets = state.presets.filter(p => p.id !== id); });
    },

    importQuery: (jsonStr) => {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.logic || !Array.isArray(parsed.rules) || !Array.isArray(parsed.groups)) {
        throw new Error('Invalid query format');
      }
      get().snapshot();
      set(state => {
        state.root = { ...parsed, id: 'root' };
        state.errors = {};
        state.results = null;
      });
    },

    resetQuery: () => {
      get().snapshot();
      set(state => {
        state.root = makeRootGroup(state.schema);
        state.errors = {};
        state.results = null;
      });
    },
  }))
);
