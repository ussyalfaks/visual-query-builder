'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { QueryGroup } from '@/lib/types';
import { ConditionGroup } from './ConditionGroup';

// Re-exported so ConditionGroup can reference these types without importing DnD Kit directly
export type { DraggableAttributes, SyntheticListenerMap };

interface Props {
  group: QueryGroup;
  depth: number;
}

export function SortableGroup({ group, depth }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-50 relative z-50' : ''}
    >
      <ConditionGroup
        group={group}
        depth={depth}
        dragHandleListeners={listeners}
        dragHandleAttributes={attributes}
      />
    </div>
  );
}
