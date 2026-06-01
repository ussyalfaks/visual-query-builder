import { describe, it, expect, beforeEach, vi } from 'vitest';
import { enableMapSet } from 'immer';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConditionGroup } from '@/components/query-builder/ConditionGroup';
import { useQueryStore } from '@/store/queryStore';

enableMapSet();

// DnD Kit needs browser pointer APIs unavailable in jsdom — mock them
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCenter: vi.fn(),
  PointerSensor: class { },
  KeyboardSensor: class { },
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

beforeEach(() => {
  useQueryStore.getState().resetQuery();
  useQueryStore.setState({ history: [], errors: {}, results: null, collapsed: new Set() });
});

describe('ConditionGroup', () => {
  it('renders "Add condition" and "Add group" buttons', () => {
    const root = useQueryStore.getState().root;
    render(<ConditionGroup group={root} depth={0} />);
    expect(screen.getByText('Add condition')).toBeInTheDocument();
    expect(screen.getByText('Add group')).toBeInTheDocument();
  });

  it('shows the correct condition count label', () => {
    const root = useQueryStore.getState().root;
    // root starts with 1 rule → "1 condition"
    render(<ConditionGroup group={root} depth={0} />);
    expect(screen.getByText('1 condition')).toBeInTheDocument();
  });

  it('clicking "Add condition" adds a rule to the store', () => {
    const root = useQueryStore.getState().root;
    const before = root.rules.length;
    render(<ConditionGroup group={root} depth={0} />);
    fireEvent.click(screen.getByText('Add condition'));
    expect(useQueryStore.getState().root.rules).toHaveLength(before + 1);
  });

  it('clicking "Add group" adds a sub-group to the store', () => {
    const root = useQueryStore.getState().root;
    render(<ConditionGroup group={root} depth={0} />);
    fireEvent.click(screen.getByText('Add group'));
    expect(useQueryStore.getState().root.groups).toHaveLength(1);
  });

  it('collapse toggle sets aria-hidden on the body wrapper', () => {
    const root = useQueryStore.getState().root;
    const { container } = render(<ConditionGroup group={root} depth={0} />);
    const toggle = screen.getByRole('button', { name: /collapse group/i });
    fireEvent.click(toggle);
    const hiddenEl = container.querySelector('[aria-hidden="true"]');
    expect(hiddenEl).not.toBeNull();
  });

  it('does not show the Remove button on the root group (depth 0)', () => {
    const root = useQueryStore.getState().root;
    render(<ConditionGroup group={root} depth={0} />);
    expect(screen.queryByLabelText('Remove group')).not.toBeInTheDocument();
  });

  it('shows Remove button on nested groups (depth > 0)', () => {
    useQueryStore.getState().addGroup('root');
    const subGroup = useQueryStore.getState().root.groups[0];
    render(<ConditionGroup group={subGroup} depth={1} />);
    expect(screen.getByLabelText('Remove group')).toBeInTheDocument();
  });

  it('displays a group-level error when injected into the store', () => {
    useQueryStore.getState().addGroup('root');
    const subGroup = useQueryStore.getState().root.groups[0];
    useQueryStore.setState({
      errors: { [subGroup.id]: 'Group must have at least one condition' },
    });
    render(<ConditionGroup group={subGroup} depth={1} />);
    expect(screen.getByText('Group must have at least one condition')).toBeInTheDocument();
  });
});
