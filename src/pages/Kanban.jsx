import { useState, useMemo, useRef } from 'react'
import { Plus } from 'lucide-react'
import { TaskCard } from '../components/TaskCard'
import { TaskModal } from '../components/TaskModal'
import { AddTaskModal } from '../components/AddTaskModal'
import { TEAM_MEMBERS } from '../data/initialData'

const COLUMNS = [
  { key: 'TODO', label: 'Por hacer', color: 'bg-gray-100 dark:bg-gray-850 dark:bg-gray-800/60', dot: 'bg-gray-400 dark:bg-gray-500', border: 'border-gray-300 dark:border-gray-600' },
  { key: 'IN_PROGRESS', label: 'En progreso', color: 'bg-blue-50 dark:bg-blue-950/30', dot: 'bg-blue-500', border: 'border-blue-300 dark:border-blue-800' },
  { key: 'REVIEW', label: 'En revisión', color: 'bg-amber-50 dark:bg-amber-950/30', dot: 'bg-amber-500', border: 'border-amber-300 dark:border-amber-800' },
  { key: 'DONE', label: 'Hecho', color: 'bg-green-50 dark:bg-green-950/30', dot: 'bg-green-500', border: 'border-green-300 dark:border-green-800' },
]

export function Kanban({ tasks, history, currentUser, onUpdate, onAdd, onComment }) {
  const [selectedTask, setSelectedTask] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [filterMember, setFilterMember] = useState('all')
  const dragTaskId = useRef(null)

  const filteredTasks = useMemo(() => {
    if (filterMember === 'all') return tasks
    if (filterMember === 'me') return tasks.filter((t) => t.assignee_id === currentUser)
    return tasks.filter((t) => t.assignee_id === Number(filterMember))
  }, [tasks, filterMember, currentUser])

  const tasksByStatus = useMemo(() => {
    const map = {}
    COLUMNS.forEach((col) => {
      map[col.key] = filteredTasks.filter((t) => t.status === col.key)
    })
    return map
  }, [filteredTasks])

  // ── Drag handlers ──────────────────────────────────────────
  const handleDragStart = (e, taskId) => {
    dragTaskId.current = taskId
    e.dataTransfer.effectAllowed = 'move'
    // Slight delay so the ghost image renders before opacity change
    setTimeout(() => {
      const el = document.getElementById(`task-${taskId}`)
      if (el) el.style.opacity = '0.4'
    }, 0)
  }

  const handleDragEnd = (taskId) => {
    const el = document.getElementById(`task-${taskId}`)
    if (el) el.style.opacity = '1'
    dragTaskId.current = null
    setDragOverCol(null)
  }

  const handleDragOver = (e, colKey) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colKey)
  }

  const handleDragLeave = (e) => {
    // Only clear if leaving the column entirely (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverCol(null)
    }
  }

  const handleDrop = (e, colKey) => {
    e.preventDefault()
    setDragOverCol(null)
    const taskId = dragTaskId.current
    if (!taskId) return
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === colKey) return
    onUpdate(taskId, { status: colKey }, currentUser)
  }
  // ───────────────────────────────────────────────────────────

  const handleUpdate = (taskId, updates, authorId) => {
    onUpdate(taskId, updates, authorId)
    setSelectedTask((prev) => (prev?.id === taskId ? { ...prev, ...updates } : prev))
  }

  const handleComment = (taskId, text, authorId) => {
    onComment(taskId, text, authorId)
    setSelectedTask((prev) =>
      prev?.id === taskId
        ? {
            ...prev,
            comments: [
              ...(prev.comments || []),
              { id: Date.now(), text, author_id: authorId, created_at: new Date().toISOString() },
            ],
          }
        : prev
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tablero Kanban</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Arrastra las tarjetas entre columnas para cambiar su estado</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filtro por miembro */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setFilterMember('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterMember === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterMember('me')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterMember === 'me'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Mis tareas
            </button>
            {TEAM_MEMBERS.map((m) => (
              <button
                key={m.id}
                onClick={() => setFilterMember(String(m.id))}
                title={m.name}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold transition-all ${
                  filterMember === String(m.id)
                    ? 'ring-2 ring-offset-1 ring-indigo-500 scale-110 shadow-sm'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: m.color }}
              >
                {m.initials}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} />
            Nueva tarea
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const isOver = dragOverCol === col.key
          return (
            <div
              key={col.key}
              className={`rounded-2xl p-4 border-2 transition-all duration-150
                ${col.color}
                ${isOver ? `${col.border} scale-[1.01] shadow-md` : 'border-transparent'}
              `}
              onDragOver={(e) => handleDragOver(e, col.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{col.label}</h3>
                <span className="ml-auto bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {tasksByStatus[col.key]?.length || 0}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-[60px]">
                {tasksByStatus[col.key]?.map((task) => (
                  <div
                    key={task.id}
                    id={`task-${task.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={() => handleDragEnd(task.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TaskCard
                      task={task}
                      onClick={() => setSelectedTask(task)}
                      onToggleDone={(t) => onUpdate(t.id, { status: t.status === 'DONE' ? 'TODO' : 'DONE' }, currentUser)}
                    />
                  </div>
                ))}

                {tasksByStatus[col.key]?.length === 0 && (
                  <div
                    className={`text-center py-8 text-xs rounded-xl border-2 border-dashed transition-colors
                      ${isOver ? `${col.border} text-gray-500 dark:text-gray-400` : 'border-gray-200 dark:border-gray-700/80 text-gray-400 dark:text-gray-500'}
                    `}
                  >
                    {isOver ? 'Suelta aquí' : 'Sin tareas'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          currentUser={currentUser}
          taskHistory={history.filter((h) => h.task_id === selectedTask.id)}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdate}
          onComment={handleComment}
        />
      )}
      {showAddModal && (
        <AddTaskModal
          currentUser={currentUser}
          onClose={() => setShowAddModal(false)}
          onAdd={onAdd}
        />
      )}
    </div>
  )
}
