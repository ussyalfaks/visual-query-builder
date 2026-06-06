'use client';
import { memo, useCallback } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor,
  PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
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

const LOGIC_BORDER = {
  AND: 'border-accent-subtle',
  OR: 'border-or-border',
};

const LOGIC_HEADER_BG = {
  AND: 'bg-accent-subtle/20',
  OR: 'bg-or-subtle',
};

const LOGIC_HEADER_BORDER = {
  AND: 'border-accent-subtle',
  OR: 'border-or-border',
};

const DEPTH_BG = ['', 'bg-surface/30', 'bg-surface/50', 'bg-surface/70', 'bg-surface'];

export const ConditionGroup = memo(function ConditionGroup({ group, depth, dragHandleListeners, dragHandleAttributes }: Props) {
  const { addRule, addGroup, removeGroup, reorderRules, reorderGroups, toggleCollapse, collapsed, errors } = useQueryStore();

  const isCollapsed = collapsed.has(group.id);
  const totalItems = group.rules.length + group.groups.length;
  const borderClass = LOGIC_BORDER[group.logic];
  const headerBgClass = LOGIC_HEADER_BG[group.logic];
  const headerBorderClass = LOGIC_HEADER_BORDER[group.logic];
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
    if (fromIndex !== -1 && toIndex !== -1) reorderRules(group.id, fromIndex, toIndex);
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
    if (fromIndex !== -1 && toIndex !== -1) reorderGroups(group.id, fromIndex, toIndex);
  }, [group.id, group.groups, reorderGroups]);

  const handleAddRule = useCallback(() => addRule(group.id), [group.id, addRule]);
  const handleAddGroup = useCallback(() => addGroup(group.id), [group.id, addGroup]);
  const handleRemove = useCallback(() => removeGroup(group.id), [group.id, removeGroup]);
  const handleToggle = useCallback(() => toggleCollapse(group.id), [group.id, toggleCollapse]);

  return (
    <div className={cn('rounded-lg border', borderClass, bgClass)}>
      {/* Group header */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2',
        headerBgClass,
        !isCollapsed && cn('border-b', headerBorderClass)
      )}>
        {dragHandleListeners && (
          <button
            {...dragHandleAttributes}
            {...dragHandleListeners}
            className="text-subtle hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none"
            aria-label="Drag group to reorder"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}

        <LogicToggle groupId={group.id} logic={group.logic} />

        <button
          onClick={handleToggle}
          className="flex items-center gap-1 text-xs text-subtle hover:text-muted-foreground transition-colors"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}
        >
          {isCollapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronDown className="h-3.5 w-3.5" />}
          <span>{totalItems} condition{totalItems !== 1 ? 's' : ''}</span>
        </button>

        <div className="flex-1" />

        {depth > 0 && (
          <button
            onClick={handleRemove}
            className="text-subtle hover:text-destructive transition-colors p-1 rounded"
            aria-label="Remove group"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {errors[group.id] && (
        <div className="mx-3 mt-2 flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {errors[group.id]}
        </div>
      )}

      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
        )}
        aria-hidden={isCollapsed}
      >
        <div className="overflow-hidden">
          <div className="p-3 flex flex-col gap-2">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={group.rules.map(r => r.id)} strategy={verticalListSortingStrategy}>
                {group.rules.map(rule => (
                  <ConditionRule key={rule.id} rule={rule} groupId={group.id} />
                ))}
              </SortableContext>
            </DndContext>

            <DndContext sensors={groupSensors} collisionDetection={closestCenter} onDragEnd={handleGroupDragEnd}>
              <SortableContext items={group.groups.map(g => g.id)} strategy={verticalListSortingStrategy}>
                {group.groups.map(subGroup => (
                  <SortableGroup key={subGroup.id} group={subGroup} depth={depth + 1} />
                ))}
              </SortableContext>
            </DndContext>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAddRule}
                className="flex items-center gap-1.5 text-xs text-subtle hover:text-muted-foreground border border-dashed border-border hover:border-muted-foreground rounded-md px-3 py-1.5 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add condition
              </button>
              <button
                onClick={handleAddGroup}
                className="flex items-center gap-1.5 text-xs text-subtle hover:text-muted-foreground border border-dashed border-border hover:border-muted-foreground rounded-md px-3 py-1.5 transition-colors"
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
