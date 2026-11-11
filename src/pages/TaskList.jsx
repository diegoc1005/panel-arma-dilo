import { useState, useMemo } from 'react'
import { Search, Plus, Trash2, Calendar, CheckCircle2, Circle, Link as LinkIcon } from 'lucide-react'
import { TEAM_MEMBERS } from '../data/initialData'
import { Avatar } from '../components/Avatar'
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badge'
import { TaskModal } from '../components/TaskModal'
import { AddTaskModal } from '../components/AddTaskModal'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

export function TaskList({ tasks, history, currentUser, onUpdate, onAdd, onDelete, onComment, defaultFilterMember = 'all' }) {
  const [search, setSearch] = useState('')
  const [filterMember, setFilterMember] = useState(defaultFilterMember)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [sortBy, setSortBy] = useState('due_date')
  const [selected, setSelected] = useState(new Set()) // IDs seleccionados para acciones en lote

  const filtered = useMemo(() => {
    let result = tasks
    if (search) result = result.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    if (filterMember !== 'all') {
      if (filterMember === 'me') {
        result = result.filter((t) => t.assignee_id === currentUser)
      } else {
        result = result.filter((t) => t.assignee_id === Number(filterMember))
      }
    }
    if (filterStatus !== 'all') result = result.filter((t) => t.status === filterStatus)
    if (filterPriority !== 'all') result = result.filter((t) => t.priority === filterPriority)
    return [...result].sort((a, b) => {
      if (sortBy === 'due_date') {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date) - new Date(b.due_date)
      }
      if (sortBy === 'priority') {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 }
        return (order[a.priority] ?? 1) - (order[b.priority] ?? 1)
      }
      return 0
    })
  }, [tasks, search, filterMember, filterStatus, filterPriority, sortBy])

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((t) => t.id)))
    }
  }

  const bulkUpdateStatus = (status) => {
    selected.forEach((id) => onUpdate(id, { status }, currentUser))
    setSelected(new Set())
  }

  const bulkAssign = (assigneeId) => {
    selected.forEach((id) => onUpdate(id, { assignee_id: Number(assigneeId) }, currentUser))
    setSelected(new Set())
  }

  const bulkDelete = () => {
    if (!window.confirm(`¿Eliminar ${selected.size} tarea(s)?`)) return
    selected.forEach((id) => onDelete(id, currentUser))
    setSelected(new Set())
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lista de tareas</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{filtered.length} tareas</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Nueva tarea
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Buscar tarea..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/80 p-1 rounded-xl">
          <button
            onClick={() => setFilterMember('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterMember === 'all'
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterMember('me')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterMember === 'me'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Mis tareas
          </button>
        </div>
        <select
          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={filterMember}
          onChange={(e) => setFilterMember(e.target.value)}
        >
          <option value="all">Todos los miembros</option>
          <option value="me">👤 Mis tareas</option>
          {TEAM_MEMBERS.map((m) => (
            <option key={m.id} value={m.id}>{m.name.split(' ').slice(0, 2).join(' ')}</option>
          ))}
        </select>
        <select
          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="TODO">Por hacer</option>
          <option value="IN_PROGRESS">En progreso</option>
          <option value="REVIEW">En revisión</option>
          <option value="DONE">Hecho</option>
        </select>
        <select
          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">Toda prioridad</option>
          <option value="HIGH">Alta</option>
          <option value="MEDIUM">Media</option>
          <option value="LOW">Baja</option>
        </select>
        <select
          className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="due_date">Ordenar: Fecha límite</option>
          <option value="priority">Ordenar: Prioridad</option>
        </select>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bg-indigo-600 text-white rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold">{selected.size} tarea(s) seleccionada(s)</span>
          <div className="flex flex-wrap gap-2 ml-2">
            <select
              onChange={(e) => { if (e.target.value) bulkUpdateStatus(e.target.value) }}
              defaultValue=""
              className="text-xs bg-indigo-500 hover:bg-indigo-400 text-white border border-indigo-400 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none"
            >
              <option value="" disabled>Cambiar estado…</option>
              <option value="TODO">Por hacer</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="REVIEW">En revisión</option>
              <option value="BLOCKED">Bloqueada</option>
              <option value="DONE">Hecho</option>
            </select>
            <select
              onChange={(e) => { if (e.target.value) bulkAssign(e.target.value) }}
              defaultValue=""
              className="text-xs bg-indigo-500 hover:bg-indigo-400 text-white border border-indigo-400 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none"
            >
              <option value="" disabled>Reasignar a…</option>
              {TEAM_MEMBERS.map((m) => (
                <option key={m.id} value={m.id}>{m.name.split(' ').slice(0, 2).join(' ')}</option>
              ))}
            </select>
            <button
              onClick={bulkDelete}
              className="text-xs bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Eliminar
            </button>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-indigo-200 hover:text-white transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  className="rounded cursor-pointer"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3">Tarea</th>
              <th className="px-4 py-3 hidden md:table-cell">Categoría</th>
              <th className="px-4 py-3 hidden sm:table-cell">Responsable</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 hidden lg:table-cell">Prioridad</th>
              <th className="px-4 py-3 hidden md:table-cell">Fecha límite</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {filtered.map((task) => {
              const isOverdue =
                task.due_date &&
                task.status !== 'DONE' &&
                isPast(parseISO(task.due_date)) &&
                !isToday(parseISO(task.due_date))
              return (
                <tr
                  key={task.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors ${selected.has(task.id) ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}
                  onClick={() => setSelectedTask(task)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded cursor-pointer"
                      checked={selected.has(task.id)}
                      onChange={() => toggleSelect(task.id)}
                    />
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onUpdate(task.id, { status: task.status === 'DONE' ? 'TODO' : 'DONE' }, currentUser)
                        }}
                        className="shrink-0 transition-transform hover:scale-110"
                        title={task.status === 'DONE' ? 'Marcar como pendiente' : 'Marcar como hecha'}
                      >
                        {task.status === 'DONE'
                          ? <CheckCircle2 size={17} className="text-green-500" />
                          : <Circle size={17} className="text-gray-300 dark:text-gray-600 hover:text-green-400 transition-colors" />
                        }
                      </button>
                      <p className={`font-medium leading-snug ${task.status === 'DONE' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                        {task.title}
                      </p>
                      {(task.links?.length || 0) > 0 && (
                        <span
                          className="flex items-center gap-0.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded shrink-0 font-medium"
                          title={`${task.links.length} enlace${task.links.length > 1 ? 's' : ''} adjunto${task.links.length > 1 ? 's' : ''}`}
                        >
                          <LinkIcon size={10} />
                          {task.links.length}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <CategoryBadge category={task.category} />
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Avatar memberId={task.assignee_id} size="sm" showName />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={task.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation()
                        onUpdate(task.id, { status: e.target.value }, currentUser)
                      }}
                      className={`text-xs font-medium rounded-lg px-2 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-300
                        ${task.status === 'DONE'    ? 'bg-green-100 text-green-700' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                          task.status === 'REVIEW'  ? 'bg-amber-100 text-amber-700' :
                          task.status === 'BLOCKED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'}`}
                    >
                      <option value="TODO">Por hacer</option>
                      <option value="IN_PROGRESS">En progreso</option>
                      <option value="REVIEW">En revisión</option>
                      <option value="BLOCKED">🚫 Bloqueada</option>
                      <option value="DONE">Hecho</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {task.due_date ? (
                      <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                        <Calendar size={12} />
                        {format(parseISO(task.due_date), "d 'de' MMM", { locale: es })}
                        {isOverdue && ' ⚠'}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(task.id, currentUser) }}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  No hay tareas que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
