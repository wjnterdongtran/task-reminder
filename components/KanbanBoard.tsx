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
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types/task';
import { useTranslation } from '@/contexts/LanguageContext';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onViewDetails?: (task: Task) => void;
}

const statusColumns = [
  { status: TaskStatus.INIT, color: 'amber' },
  { status: TaskStatus.WORKING, color: 'cyan' },
  { status: TaskStatus.NEED_TAKING_CARE, color: 'rose' },
  { status: TaskStatus.DONE, color: 'emerald' },
] as const;

export default function KanbanBoard({ tasks, onStatusChange, onDeleteTask, onViewDetails }: KanbanBoardProps) {
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

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // Check if dropped over a valid status column
    if (Object.values(TaskStatus).includes(newStatus)) {
      onStatusChange(taskId, newStatus);
    }

    setActiveTask(null);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
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
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map(({ status, color }) => {
            const columnTasks = getTasksByStatus(status);
            return (
              <KanbanColumn
                key={status}
                status={status}
                color={color}
                tasks={columnTasks}
                onDeleteTask={onDeleteTask}
                onViewDetails={onViewDetails}
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
