import { describe, it, expect, beforeEach } from 'vitest';
import { enableMapSet } from 'immer';
import { useQueryStore } from '@/store/queryStore';

enableMapSet();

beforeEach(() => {
  useQueryStore.getState().resetQuery();
  useQueryStore.setState({ history: [], errors: {}, results: null, collapsed: new Set() });
});

describe('addRule', () => {
  it('appends a rule to the specified group', () => {
    const before = useQueryStore.getState().root.rules.length;
    useQueryStore.getState().addRule('root');
    expect(useQueryStore.getState().root.rules).toHaveLength(before + 1);
  });

  it('new rule has a unique id', () => {
    useQueryStore.getState().addRule('root');
    useQueryStore.getState().addRule('root');
    const ids = useQueryStore.getState().root.rules.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('removeRule', () => {
  it('removes the rule with the given id', () => {
    useQueryStore.getState().addRule('root');
    const ruleId = useQueryStore.getState().root.rules[0].id;
    useQueryStore.getState().removeRule('root', ruleId);
    expect(useQueryStore.getState().root.rules.find(r => r.id === ruleId)).toBeUndefined();
  });
});

describe('updateRule', () => {
  it('updates the field of an existing rule', () => {
    const ruleId = useQueryStore.getState().root.rules[0].id;
    useQueryStore.getState().updateRule('root', ruleId, { field: 'age' });
    const updated = useQueryStore.getState().root.rules.find(r => r.id === ruleId);
    expect(updated?.field).toBe('age');
  });

  it('resets value when field changes', () => {
    const ruleId = useQueryStore.getState().root.rules[0].id;
    useQueryStore.getState().updateRule('root', ruleId, { value: 'Alice' });
    useQueryStore.getState().updateRule('root', ruleId, { field: 'age' });
    const updated = useQueryStore.getState().root.rules.find(r => r.id === ruleId);
    expect(updated?.value).toBe('');
  });
});

describe('addGroup / removeGroup', () => {
  it('adds a nested group under the given parent', () => {
    useQueryStore.getState().addGroup('root');
    expect(useQueryStore.getState().root.groups).toHaveLength(1);
  });

  it('new nested group contains a default rule', () => {
    useQueryStore.getState().addGroup('root');
    const subGroup = useQueryStore.getState().root.groups[0];
    expect(subGroup.rules.length).toBeGreaterThan(0);
  });

  it('removeGroup deletes the group by id', () => {
    useQueryStore.getState().addGroup('root');
    const gid = useQueryStore.getState().root.groups[0].id;
    useQueryStore.getState().removeGroup(gid);
    expect(useQueryStore.getState().root.groups).toHaveLength(0);
  });
});

describe('reorderRules', () => {
  it('moves a rule from one index to another', () => {
    useQueryStore.getState().addRule('root');
    useQueryStore.getState().addRule('root');
    const rules = useQueryStore.getState().root.rules;
    const firstId = rules[0].id;
    useQueryStore.getState().reorderRules('root', 0, 2);
    const reordered = useQueryStore.getState().root.rules;
    expect(reordered[2].id).toBe(firstId);
  });
});

describe('reorderGroups', () => {
  it('moves a sub-group from one index to another', () => {
    useQueryStore.getState().addGroup('root');
    useQueryStore.getState().addGroup('root');
    const groups = useQueryStore.getState().root.groups;
    const firstId = groups[0].id;
    useQueryStore.getState().reorderGroups('root', 0, 1);
    const reordered = useQueryStore.getState().root.groups;
    expect(reordered[1].id).toBe(firstId);
  });
});

describe('undo / snapshot', () => {
  it('undo restores the previous root state', () => {
    const before = useQueryStore.getState().root.rules.length;
    useQueryStore.getState().addRule('root');
    useQueryStore.getState().undo();
    expect(useQueryStore.getState().root.rules).toHaveLength(before);
  });

  it('undo does nothing when history is empty', () => {
    expect(() => useQueryStore.getState().undo()).not.toThrow();
  });
});

describe('savePreset / loadPreset / deletePreset', () => {
  it('savePreset adds a preset with the given name', () => {
    const before = useQueryStore.getState().presets.length;
    useQueryStore.getState().savePreset('Test Preset');
    expect(useQueryStore.getState().presets).toHaveLength(before + 1);
    expect(useQueryStore.getState().presets.at(-1)?.name).toBe('Test Preset');
  });

  it('loadPreset replaces the root query', () => {
    const preset = {
      id: 'px', logic: 'OR' as const,
      rules: [{ id: 'r1', field: 'age', operator: 'greater than' as const, value: '30' }],
      groups: [],
    };
    useQueryStore.getState().loadPreset(preset);
    expect(useQueryStore.getState().root.logic).toBe('OR');
  });

  it('deletePreset removes the preset by id', () => {
    useQueryStore.getState().savePreset('ToDelete');
    const id = useQueryStore.getState().presets.at(-1)!.id;
    useQueryStore.getState().deletePreset(id);
    expect(useQueryStore.getState().presets.find(p => p.id === id)).toBeUndefined();
  });
});

describe('importQuery', () => {
  it('imports a valid query JSON string', () => {
    const q = JSON.stringify({
      id: 'root', logic: 'AND',
      rules: [{ id: 'r1', field: 'name', operator: 'equals', value: 'Alice' }],
      groups: [],
    });
    useQueryStore.getState().importQuery(q);
    expect(useQueryStore.getState().root.rules[0].value).toBe('Alice');
  });

  it('throws on invalid JSON structure', () => {
    expect(() => useQueryStore.getState().importQuery('{"foo":"bar"}')).toThrow('Invalid query format');
  });
});

describe('toggleCollapse', () => {
  it('collapses a group', () => {
    useQueryStore.getState().toggleCollapse('root');
    expect(useQueryStore.getState().collapsed.has('root')).toBe(true);
  });

  it('uncollapses a previously collapsed group', () => {
    useQueryStore.getState().toggleCollapse('root');
    useQueryStore.getState().toggleCollapse('root');
    expect(useQueryStore.getState().collapsed.has('root')).toBe(false);
  });
});
