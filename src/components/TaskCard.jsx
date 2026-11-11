import { Calendar, MessageSquare, CheckCircle2, Circle, Link as LinkIcon } from 'lucide-react'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { Avatar } from './Avatar'
import { PriorityBadge, CategoryBadge } from './Badge'

export function TaskCard({ task, onClick, onToggleDone }) {
  const isDone = task.status === 'DONE'
  const isOverdue = task.due_date && !isDone && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date))
  const isDueToday = task.due_date && isToday(parseISO(task.due_date))

  const handleToggle = (e) => {
    e.stopPropagation()
    onToggleDone?.(task)
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all duration-200 group
        ${isDone ? 'border-green-200 dark:border-green-800/60 bg-green-50/50 dark:bg-green-950/20' : 'border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/50'}
      `}
    >
      {/* Top row */}
      <div className="flex items-start gap-2 mb-2">
        {/* Toggle button */}
        <button
          onClick={handleToggle}
          className="mt-0.5 shrink-0 transition-transform hover:scale-110"
          title={isDone ? 'Marcar como pendiente' : 'Marcar como hecha'}
        >
          {isDone
            ? <CheckCircle2 size={18} className="text-green-500" />
            : <Circle size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors" />
          }
        </button>

        <p className={`flex-1 text-sm font-medium leading-snug line-clamp-2 transition-colors
          ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400'}
        `}>
          {task.title}
        </p>

        <Avatar memberId={task.assignee_id} size="sm" />
      </div>

      {/* Category */}
      <div className="mb-3 ml-6">
        <CategoryBadge category={task.category} />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between ml-6">
        <PriorityBadge priority={task.priority} />
        <div className="flex items-center gap-3">
          {(task.links?.length || 0) > 0 && (
            <span
              className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded"
              title={`${task.links.length} enlace${task.links.length > 1 ? 's' : ''} adjunto${task.links.length > 1 ? 's' : ''}`}
            >
              <LinkIcon size={11} />
              {task.links.length}
            </span>
          )}
          {(task.comments?.length || 0) > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MessageSquare size={12} />
              {task.comments.length}
            </span>
          )}
          {task.due_date && (
            <span className={`flex items-center gap-1 text-xs font-medium ${
              isOverdue ? 'text-red-500' : isDueToday ? 'text-orange-500' : 'text-gray-400'
            }`}>
              <Calendar size={12} />
              {format(parseISO(task.due_date), 'd MMM', { locale: es })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
