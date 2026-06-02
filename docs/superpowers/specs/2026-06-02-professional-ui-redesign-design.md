# Professional UI Redesign — Design Spec

**Date:** 2026-06-02
**Status:** Approved

## Overview

Redesign the Visual Query Builder from a functional prototype into a professional SaaS product. Target audience: developers and technical users who want to filter data without writing SQL. The product is dark-only, developer-focused (Supabase/Vercel aesthetic), with a public landing page at `/` and the builder app at `/app`.

Approach: **in-place restyle** — no new libraries. Keep all existing query logic, store, and tests intact. Update CSS variables, component styling, routing, and add the landing page.

---

## 1. Routing

| Route | Content |
|-------|---------|
| `/` | Landing page (marketing) |
| `/app` | Query builder app (split panel) |

- `app/page.tsx` becomes the landing page
- New `app/app/page.tsx` hosts the builder
- `app/layout.tsx` stays shared (Geist font, metadata)

---

## 2. Color System

Dark-first throughout. No light mode. Remove the dark mode toggle entirely.

### Background layers (depth)
| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#050505` | Page background |
| `--surface` | `#0f0f0f` | Panel, nav, cards |
| `--surface-raised` | `#161616` | Condition rules, dropdowns |
| `--surface-hover` | `#1e1e1e` | Hover states, muted fill |
| `--border` | `#262626` | All borders |

### Text
| Token | Value | Usage |
|-------|-------|-------|
| `--foreground` | `#f5f5f5` | Headings, primary text |
| `--muted-foreground` | `#a1a1aa` | Labels, secondary text |
| `--subtle` | `#52525b` | Disabled, placeholders, dividers |

### Accent — Emerald
| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#10b981` | Run button, AND badges, active tab underline, links |
| `--accent-hover` | `#059669` | Run button hover |
| `--accent-subtle` | `#064e3b` | AND badge background |
| `--accent-text` | `#d1fae5` | Code values, monospace output |

### Semantic
| Token | Value | Usage |
|-------|-------|-------|
| `--or-bg` | `#4c1d95` | OR badge background |
| `--or-text` | `#a78bfa` | OR badge text |
| `--or-subtle` | `#1a0d38` | OR group background |
| `--or-border` | `#3b1f6e` | OR group border |
| `--destructive` | `#ef4444` | Errors, delete actions |
| `--warning` | `#f59e0b` | Warnings |

### Implementation
Update `app/globals.css` — replace the existing `:root` and `.dark` blocks with a single dark `:root`. Remove `.dark` class entirely. Delete the `dark:` Tailwind variants from all components.

---

## 3. Landing Page (`/`)

Single scrolling page. Dark throughout.

### Sections (top to bottom)

**Nav** (sticky)
- Logo: green `#10b981` square with "Q" + "Visual Query Builder" wordmark
- Links: Docs, Pricing, Sign in (muted)
- CTA: green pill button "Get started free →"
- Background: `--surface` (`#0f0f0f`), bottom border `--border`

**Hero**
- Subtle radial green glow behind content (CSS `radial-gradient`)
- Pill badge: "No SQL required" — green dot + green text on dark green bg
- Headline: `Build database queries` / `visually.` — "visually." in `--accent` green. Font size ~60px desktop, font-weight 800, letter-spacing -0.03em
- Sub-headline: one line describing the product (~14px, muted)
- Two CTAs side by side: `Start building for free →` (green filled) + `View docs ↗` (ghost with border)
- **Product screenshot**: browser-frame mockup (traffic light dots + address bar) showing the split-panel app with a real nested query. Shadow: `0 32px 64px rgba(0,0,0,0.6)`

**Features** (4-card grid, 2×2)
1. Unlimited nesting — AND/OR groups at any depth
2. Drag & drop — reorder conditions freely
3. Live SQL preview — query updates in real time
4. Import & export — JSON save/load

Each card: `--surface` bg, `--border` border, emoji icon, bold title, muted description.

**Footer** (minimal)
- Logo (small) + copyright left
- Privacy, Terms, GitHub right
- Border top, very dark bg

### File: `app/page.tsx`
Fully static — no `'use client'`, no store imports. Pure JSX + Tailwind.

---

## 4. App Shell (`/app`)

Full-height layout (`h-screen`, no page scroll). Three zones: top bar, split panel body, status bar.

### Top Bar (44px)
Background: `--surface`. Bottom border: `--border`.

Left side (left to right):
- Logo mark (green square "Q") + wordmark
- `/` divider (muted)
- "Untitled query" breadcrumb (muted) — static for now

Right side (left to right):
- Error badge (red, only visible when `errorCount > 0`)
- Divider
- Undo button, Reset button
- Divider
- Presets dropdown button
- Divider
- Import button, Export button
- Divider
- **Run query** button (green filled, black text, font-weight 700)

All secondary buttons: `--surface-raised` bg, `--border` border, `--muted-foreground` text.

### Split Panel Body (flex, fills remaining height)

**Left panel (50%)** — Conditions
- Right border: `--border`
- Panel header: "CONDITIONS" label (uppercase, `--subtle`, 9px) + "⌘↵ to run" hint right-aligned
- Content: scrollable, `padding: 10px`
- Contains `<ConditionGroup>` (root group, depth=0)

**Right panel (50%)** — Output
- Tabs along top: Preview · Results (count badge) · JSON · History (count badge)
- Active tab: `--accent` underline + `--foreground` text
- Tab content: scrollable, `padding: 14px`
- Builder tab is **removed** from tabs — the builder now lives permanently on the left

**Tab content mapping:**
| Tab | Component |
|-----|-----------|
| Preview | `<QueryPreview>` — SQL output with syntax highlighting |
| Results | `<ResultsPanel>` |
| JSON | Raw JSON pre block |
| History | `<HistoryPanel>` |

### Status Bar (28px)
Background: `--surface`. Top border `#1a1a1a`.
- Left: "{n} records in schema"
- Center: error count (red) when errors present
- Right: "⌘Z undo · ⌘↵ run" keyboard hints (subtle)

### File: `app/app/page.tsx`
`'use client'` — imports `QueryBuilder` component. Full-height shell, no max-width constraint.

### QueryBuilder component changes
- Remove `activeTab === 'builder'` tab — builder is always left panel
- Tabs now only contain: Preview, Results, JSON, History
- Remove the `<Toolbar>` from QueryBuilder — toolbar moves to the top bar in the page shell
- `app/app/page.tsx` reads `useQueryStore()` directly for all toolbar actions — no prop drilling needed

---

## 5. Component Updates

### `globals.css`
- Replace all CSS variables with the new dark token set (Section 2)
- Remove `.dark {}` block
- Add `--surface`, `--surface-raised`, `--surface-hover`, `--subtle`, `--accent`, `--accent-hover`, `--accent-subtle`, `--accent-text`, `--or-*` tokens
- Add `@theme inline` mappings for all new tokens

### `LogicToggle`
- Segmented pill control (single element, not two separate buttons)
- AND active: `--accent-subtle` bg, `--accent` text, `--accent-subtle` border
- OR active: `--or-bg` bg, `--or-text` text, `--or-border` border
- Inactive side: transparent, `--subtle` text

### `ConditionRule`
- Card bg: `--surface-raised` (`#161616`)
- Border: `--border` default, `--destructive`/50 on error, `--accent` on value focus
- Field/operator selects: `--background` bg, `--border` border, `--muted-foreground` text
- Value input: `--background` bg, monospace font, `--accent-text` text color, `--accent` focus border
- Drag handle: `--subtle` color, visible only on group hover
- Remove button: `--subtle` color, visible only on rule hover, red on hover

### `ConditionGroup`
- Root group (depth 0): `--accent-subtle` header bg, `--accent-subtle`/30 border
- OR groups: `--or-subtle` header bg, `--or-border` border
- Deeper AND groups: progressively darker via existing `DEPTH_BG` pattern but using new tokens
- Collapse animation stays (grid-rows transition)

### `ResultsPanel`
- Table header: `--surface-raised` bg, uppercase 8px labels, `--subtle` text
- Rows: `--background` bg, `--surface-hover` on hover
- Status badges: dark bg versions (active: `#064e3b`/`#6ee7b7`, inactive: `#1c1c1c`/`#a1a1aa`, pending: amber dark, banned: red dark)
- Plan badges: dark bg versions (free: zinc, pro: blue dark, enterprise: purple dark)
- Monospace font for name/age/numeric cells
- Score bar: stays, uses `--accent` fill

### `QueryPreview`
- Code block: `--surface-raised` bg, `--border` border
- SQL keywords (`SELECT`, `WHERE`, `AND`, `OR`): `--subtle` color
- Values (strings, numbers): `--accent-text` color
- Error lines: `--destructive` color with inline highlight

### `Toolbar`

- Deleted. All toolbar logic (run, undo, reset, presets, import/export) is absorbed into `app/app/page.tsx` inline in the top bar
- The file input ref, preset dropdown state, and save-name state all move into the page component

---

## 6. What Does NOT Change

- All query engine logic (`lib/`, `store/`)
- All 80+ tests — zero test changes expected
- Drag-and-drop logic (`@dnd-kit`)
- Keyboard shortcuts (⌘Z, ⌘↵)
- Import/export, presets, history functionality
- Collapse animation on groups
- Error validation logic

---

## 7. Files Changed

| File | Change |
|------|--------|
| `app/globals.css` | Full token replacement, remove `.dark` block |
| `app/layout.tsx` | Update metadata title/description |
| `app/page.tsx` | Replace with landing page |
| `app/app/page.tsx` | New — app shell with split panel |
| `components/QueryBuilder.tsx` | Remove Builder tab, remove Toolbar, expose left/right panel structure |
| `components/toolbar/Toolbar.tsx` | Deleted — logic absorbed into app shell |
| `components/query-builder/LogicToggle.tsx` | Segmented pill, new token styles |
| `components/query-builder/ConditionRule.tsx` | Dark card styling, accent border on value |
| `components/query-builder/ConditionGroup.tsx` | Dark group headers, OR purple tokens |
| `components/results/ResultsPanel.tsx` | Dark table, dark badges, monospace values |
| `components/preview/QueryPreview.tsx` | Syntax color tokens |
| `tailwind.config.ts` | Add new token mappings if needed |
