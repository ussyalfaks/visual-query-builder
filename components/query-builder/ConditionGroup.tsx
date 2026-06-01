'use client';
import { memo, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { ChevronDown, ChevronRight, Plus, FolderPlus, Trash2, AlertCircle, GripVertical } from 'lucide-react';
import { SortableGroup } from './SortableGroup';
import type { QueryGroup } from '@/lib/types';
import { useQueryStore } from '@/store/queryStore';
import { ConditionRule } from './ConditionRule';
import { LogicToggle } from './LogicToggle';
import { cn } from '@/lib/utils';

interface Props {
  group: QueryGroup;
  depth: number;
  dragHandleListeners?: SyntheticListenerMap;
  dragHandleAttributes?: DraggableAttributes;
}

const DEPTH_COLORS = [
  'border-blue-200 dark:border-blue-800',
  'border-amber-200 dark:border-amber-800',
  'border-green-200 dark:border-green-800',
  'border-purple-200 dark:border-purple-800',
  'border-pink-200 dark:border-pink-800',
];

const DEPTH_BG = [
  '',
  'bg-muted/20',
  'bg-muted/30',
  'bg-muted/40',
  'bg-muted/50',
];

// This component renders itself recursively for unlimited nesting depth.
export const ConditionGroup = memo(function ConditionGroup({ group, depth, dragHandleListeners, dragHandleAttributes }: Props) {
  const { addRule, addGroup, removeGroup, reorderRules, reorderGroups, toggleCollapse, collapsed, errors } = useQueryStore();

  const isCollapsed = collapsed.has(group.id);
  const totalItems = group.rules.length + group.groups.length;
  const borderClass = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];
  const bgClass = DEPTH_BG[Math.min(depth, DEPTH_BG.length - 1)];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = group.rules.findIndex(r => r.id === active.id);
    const toIndex = group.rules.findIndex(r => r.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderRules(group.id, fromIndex, toIndex);
    }
  }, [group.id, group.rules, reorderRules]);

  const groupSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleGroupDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = group.groups.findIndex(g => g.id === active.id);
    const toIndex = group.groups.findIndex(g => g.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderGroups(group.id, fromIndex, toIndex);
    }
  }, [group.id, group.groups, reorderGroups]);

  const handleAddRule = useCallback(() => addRule(group.id), [group.id, addRule]);
  const handleAddGroup = useCallback(() => addGroup(group.id), [group.id, addGroup]);
  const handleRemove = useCallback(() => removeGroup(group.id), [group.id, removeGroup]);
  const handleToggle = useCallback(() => toggleCollapse(group.id), [group.id, toggleCollapse]);

  return (
    <div className={cn('rounded-lg border', borderClass, bgClass)}>
      {/* Group header */}
      <div className={cn('flex items-center gap-2 px-3 py-2', !isCollapsed && 'border-b', borderClass)}>
        {/* Drag handle — present on non-root groups via SortableGroup */}
        {dragHandleListeners && (
          <button
            {...dragHandleAttributes}
            {...dragHandleListeners}
            className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none"
            aria-label="Drag group to reorder"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}
        <LogicToggle groupId={group.id} logic={group.logic} />

        <button
          onClick={handleToggle}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}
        >
          {isCollapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronDown className="h-3.5 w-3.5" />
          }
          <span>{totalItems} condition{totalItems !== 1 ? 's' : ''}</span>
        </button>

        <div className="flex-1" />

        {depth > 0 && (
          <button
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
            aria-label="Remove group"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Group-level validation error */}
      {errors[group.id] && (
        <div className="mx-3 mt-2 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {errors[group.id]}
        </div>
      )}

      {/* Group body — grid-rows transition provides smooth CSS collapse animation */}
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
        )}
        aria-hidden={isCollapsed}
      >
        <div className="overflow-hidden">
          <div className="p-3 flex flex-col gap-2">
            {/* Drag-and-drop sortable rules */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={group.rules.map(r => r.id)} strategy={verticalListSortingStrategy}>
                {group.rules.map(rule => (
                  <ConditionRule key={rule.id} rule={rule} groupId={group.id} />
                ))}
              </SortableContext>
            </DndContext>

            {/* RECURSIVE: sub-groups sortable via their own DnD context */}
            <DndContext sensors={groupSensors} collisionDetection={closestCenter} onDragEnd={handleGroupDragEnd}>
              <SortableContext items={group.groups.map(g => g.id)} strategy={verticalListSortingStrategy}>
                {group.groups.map(subGroup => (
                  <SortableGroup key={subGroup.id} group={subGroup} depth={depth + 1} />
                ))}
              </SortableContext>
            </DndContext>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddRule}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-foreground rounded-md px-3 py-1.5 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add condition
              </button>
              <button
                onClick={handleAddGroup}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-foreground rounded-md px-3 py-1.5 transition-colors"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                Add group
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
