'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types/task';
import { useTranslation } from '@/contexts/LanguageContext';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  status: TaskStatus;
  color: 'amber' | 'cyan' | 'rose' | 'emerald';
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
}

const colorStyles = {
  amber: {
    header: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    glow: 'shadow-amber-500/10',
    hover: 'border-amber-500/50',
  },
  cyan: {
    header: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    glow: 'shadow-cyan-500/10',
    hover: 'border-cyan-500/50',
  },
  rose: {
    header: 'from-rose-500/20 to-rose-600/10 border-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    glow: 'shadow-rose-500/10',
    hover: 'border-rose-500/50',
  },
  emerald: {
    header: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    glow: 'shadow-emerald-500/10',
    hover: 'border-emerald-500/50',
  },
};

export default function KanbanColumn({ status, color, tasks, onDeleteTask, onEditTask, onViewDetails }: KanbanColumnProps) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const getStatusLabel = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.INIT:
        return t('taskStatus.init');
      case TaskStatus.WORKING:
        return t('taskStatus.working');
      case TaskStatus.NEED_TAKING_CARE:
        return t('taskStatus.needCare');
      case TaskStatus.DONE:
        return t('taskStatus.done');
      default:
        return '';
    }
  };

  const styles = colorStyles[color];

  return (
    <div className="flex flex-col h-full min-h-[600px]">
      {/* Column Header */}
      <div
        className={`
          bg-gradient-to-br ${styles.header}
          border rounded-t-xl px-4 py-3
          backdrop-blur-sm flex-shrink-0
        `}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            {getStatusLabel(status)}
          </h3>
          <span
            className={`
              ${styles.badge}
              px-2.5 py-1 rounded-full text-xs font-bold border
              transition-all duration-200
            `}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable Area */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 bg-slate-800/30 border-x border-b rounded-b-xl
          transition-all duration-200 p-3 space-y-3 min-h-[500px]
          overflow-y-auto max-h-[calc(100vh-300px)]
          ${isOver ? `${styles.hover} ${styles.glow} shadow-2xl bg-slate-700/50` : 'border-slate-700/50'}
        `}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[200px] text-slate-500 text-sm">
              <div className="text-center">
                <div className="mb-2 text-2xl opacity-30">·</div>
                <div>{t('kanban.emptyColumn')}</div>
              </div>
            </div>
          ) : (
            <>
              {tasks.map((task) => <KanbanCard key={task.id} task={task} onDeleteTask={onDeleteTask} onEditTask={onEditTask} onViewDetails={onViewDetails} />)}
              {/* Extra space at bottom for dropping */}
              <div className="min-h-[100px]"></div>
            </>
          )}
        </SortableContext>

        {/* Drop Indicator */}
        {isOver && tasks.length > 0 && (
          <div
            className={`
              border-2 border-dashed rounded-lg p-4 text-center
              ${styles.hover} ${styles.glow}
              animate-pulse
            `}
          >
            <span className="text-sm text-slate-400 font-medium">{t('kanban.dropHere')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
