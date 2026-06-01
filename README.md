# Visual Query Builder

A production-grade visual query builder built with Next.js 16 (App Router), TypeScript, Zustand, and DnD Kit.

## Features

- Recursive AND/OR condition groups with unlimited nesting depth
- Schema-driven inputs: date pickers, enum dropdowns, number inputs
- 14 operators: equals, contains, between, in array, regex, and more
- Live SQL and MongoDB query preview with real-time updates
- Query execution against a 20-row mock dataset with paginated sortable results
- Drag-and-drop reordering for both rules and groups (DnD Kit)
- Animated group collapse/expand via CSS grid-rows transition
- Undo history (30 snapshots), saved presets, export/import JSON
- Dark/light mode, keyboard shortcuts (`Ctrl+Z` undo, `Ctrl+Enter` run)
- 80 unit and integration tests across engine, validators, formatters, store, and components

## Getting Started

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # 80 tests
npm run build
```

## Architecture

### Recursive Rendering Strategy

`ConditionGroup` is the core recursive component. Each instance renders its own rules via `<ConditionRule>`, then maps over `group.groups` and renders `<SortableGroup>` for each — which wraps another `<ConditionGroup depth={depth+1}>`. There is no hardcoded depth limit.

Depth-coloured borders (blue → amber → green → purple) give visual nesting cues. Collapse state is stored in a `Set<string>` in the Zustand store keyed by group ID, so collapse is independent per group across all nesting levels.

The CSS collapse animation uses a `grid-rows-[0fr/1fr]` transition on a wrapper div — the body stays in the DOM, so collapsed groups don't lose their state.

### State Management

Single Zustand store with Immer middleware. The entire query tree lives in one `QueryGroup` root node (`id: 'root'`). Every mutation uses a recursive `findGroup(node, id)` helper to locate the target node before mutating the Immer draft — so add/update/remove operations work at any nesting depth with identical code.

Before every destructive action (`addRule`, `removeRule`, `addGroup`, `removeGroup`, `loadPreset`) a `snapshot()` call pushes a deep-cloned copy of root onto a 30-item history stack. `undo()` pops the stack and replaces root.

Validation runs inline on every `updateRule`, `removeRule`, `addGroup`, and `removeGroup`, producing a `Record<string, string>` of errors keyed by rule/group ID for immediate inline display.

### Query Engine Design

`evaluateGroup(row, group, schema)` recursively evaluates a single data row against a `QueryGroup` tree:

1. Each rule in `group.rules` is passed to `applyRule()` which switches on the operator
2. Each sub-group in `group.groups` is evaluated via a recursive `evaluateGroup()` call
3. All results are collected into a flat boolean array and reduced with `every` (AND) or `some` (OR)

`executeQuery(data, root, schema)` simply calls `Array.filter(row => evaluateGroup(row, root, schema))`.

The formatters (`toSQL`, `toMongo`) use the same recursive walk — nested groups produce parenthesised SQL clauses and nested `$and`/`$or` MongoDB arrays.

### Query Validation Engine

`validateRule(rule, schema)` checks operator/type compatibility (e.g. blocks `contains` on numbers), value presence, numeric/date format, between range direction, and array operator minimum values.

`validateGroup(group, schema)` recurses the tree collecting all errors into a flat `Record<string, string>`. Non-root groups with zero rules and zero sub-groups are also flagged. Errors are keyed by rule or group ID so each control can display its own inline error without a global error list.

## Git Workflow (9 PRs)

`feat/core-types` → `feat/query-engine` → `feat/zustand-store` → `feat/recursive-ui` → `feat/live-preview` → `feat/results-panel` → `feat/toolbar` → `feat/tests` → `feat/docs`

## Performance Optimization Techniques

1. **`React.memo` on every component** — `ConditionGroup`, `ConditionRule`, `ValueInput`, and `LogicToggle` are all wrapped in `memo`. React skips re-rendering any component whose props haven't shallowly changed, which is critical for deeply nested trees where a rule change in one branch would otherwise cascade up and back down the entire tree.

2. **`useCallback` for all event handlers** — Every `onClick`/`onChange` handler inside `ConditionGroup` and `ConditionRule` is wrapped in `useCallback` with explicit dependency arrays. This keeps prop references stable between renders so `memo` can do its job.

3. **`useMemo` for the live preview** — `QueryPreview` wraps `toSQL` / `toMongo` in `useMemo([root, schema, activeFormat])`. Serializing and formatting the entire query tree on every keystroke is unnecessary; this defers recalculation until the actual inputs change.

4. **Zustand + Immer for structural sharing** — Immer produces a structurally-shared draft: only the nodes that were mutated get new object references. Combined with `memo`, only the path from the root to the changed node re-renders; sibling branches remain untouched.

5. **Stable DnD sensor memoisation** — `useSensors` is called at the top of the component, not inside callbacks, so the sensor array reference is stable across renders and doesn't trigger DnD re-initialisation.

6. **Zustand selector in `LogicToggle`** — `LogicToggle` subscribes to only `setLogic` via a selector (`useQueryStore(s => s.setLogic)`), preventing it from re-rendering when unrelated store slices change.

## Trade-offs Made

| Decision | What was gained | What was sacrificed |
|---|---|---|
| **Single global Zustand store** | Simple data flow, easy undo, no prop drilling | All components share one store instance; large or multi-user apps would need scoped stores |
| **Recursive `findGroup` on every mutation** | Works for unlimited nesting with minimal code | O(n) tree walk per mutation — acceptable for query trees (rarely > 20 nodes), not suitable for thousands of nodes |
| **`deepClone` (JSON serialize) for history snapshots** | Dead simple, no library needed | Slow for very large query trees; a structural-diff approach (e.g., Immer patches) would be more efficient at scale |
| **Immer for state mutations** | Ergonomic mutable-style code with immutable semantics | Adds ~14 kB bundle; the same result could be achieved with plain spread operators at the cost of verbosity |
| **DnD only for rules and direct-child groups** | Clean drag zones, no ambiguity | Cross-group or cross-level rule moves are not supported; drag-and-drop only reorders siblings |
| **CSS grid-rows for collapse animation** | Zero JS, no added deps, 60 fps GPU-composited | Requires Tailwind's arbitrary-value support; `max-height` would be more universally supported but has timing jank on variable-height content |
| **Mock dataset hard-coded in `data/mockData.ts`** | Works offline, no API needed, deterministic tests | Schema changes require updating both `schema.ts` and `mockData.ts` manually |
| **`toSQL` / `toMongo` recursive formatters (no AST)** | Simple, readable, no intermediate representation | Adding a third format (e.g., GraphQL) requires a new recursive walk rather than a single emitter on a shared AST |
