'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types/task';
import { useTranslation } from '@/contexts/LanguageContext';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onReorderTasks: (tasks: Task[]) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
  onTogglePin?: (taskId: string, isPinned: boolean) => void;
}

const statusColumns = [
  { status: TaskStatus.WORKING, color: 'cyan' },
  { status: TaskStatus.NEED_TAKING_CARE, color: 'rose' },
  { status: TaskStatus.DONE, color: 'emerald' },
] as const;

export default function KanbanBoard({ tasks, onStatusChange, onReorderTasks, onDeleteTask, onEditTask, onViewDetails, onTogglePin }: KanbanBoardProps) {
  const { t } = useTranslation();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id;

    // Find the active task
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) {
      setActiveTask(null);
      return;
    }

    // Check if dropped over a column (status)
    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
      const newStatus = overId as TaskStatus;

      // If status changed, move to end of new column
      if (activeTask.status !== newStatus) {
        // Optimistic update: apply immediately then call the update function
        const updatedTasks = tasks.map((t) =>
          t.id === activeId ? { ...t, status: newStatus } : t
        );
        onReorderTasks(updatedTasks);

        // Then update the status in the database
        setTimeout(() => {
          onStatusChange(activeId, newStatus);
        }, 0);
      }
    } else {
      // Dropped over another task - handle reordering within same column
      const overTask = tasks.find((t) => t.id === overId);

      if (overTask && activeTask.status === overTask.status) {
        // Reordering within the same column
        const oldIndex = tasks.findIndex((t) => t.id === activeId);
        const newIndex = tasks.findIndex((t) => t.id === overId);

        if (oldIndex !== newIndex) {
          const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
          onReorderTasks(reorderedTasks);
        }
      } else if (overTask) {
        // Dragged over a task in a different column - move to end of that column
        // Optimistic update: apply immediately then call the update function
        const updatedTasks = tasks.map((t) =>
          t.id === activeId ? { ...t, status: overTask.status } : t
        );
        onReorderTasks(updatedTasks);

        // Then update the status in the database
        setTimeout(() => {
          onStatusChange(activeId, overTask.status);
        }, 0);
      }
    }

    // Delay clearing activeTask slightly to ensure smooth transition
    setTimeout(() => {
      setActiveTask(null);
    }, 100);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    const filtered = tasks.filter((task) => task.status === status);
    // Sort: Pinned tasks first, then by pinned time, then by updated time
    return filtered.sort((a, b) => {
      // Pinned tasks always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // If both pinned, sort by pinnedAt (most recently pinned first)
      if (a.isPinned && b.isPinned) {
        const aPinnedTime = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0;
        const bPinnedTime = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0;
        return bPinnedTime - aPinnedTime;
      }

      // Finally by updatedAt
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  };

  return (
    <div className="w-full">
      {/* Board Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white font-mono tracking-tight mb-2">
          {t('kanban.boardTitle')}
        </h2>
        <p className="text-sm text-slate-400">{t('kanban.dragHint')}</p>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statusColumns.map(({ status, color }) => {
            const columnTasks = getTasksByStatus(status);
            return (
              <KanbanColumn
                key={status}
                status={status}
                color={color}
                tasks={columnTasks}
                onDeleteTask={onDeleteTask}
                onEditTask={onEditTask}
                onViewDetails={onViewDetails}
                onTogglePin={onTogglePin}
              />
            );
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-90 rotate-3 scale-105 transition-transform">
              <KanbanCard task={activeTask} onDeleteTask={onDeleteTask} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
