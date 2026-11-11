import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, X, ListTodo, StickyNote, Clock } from 'lucide-react'
import { TEAM_MEMBERS } from '../data/initialData'
import { StatusBadge } from './Badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function GlobalSearch({ tasks, notes, history, onNavigate, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return { tasks: [], notes: [], history: [] }

    const matchTasks = tasks
      .filter((t) =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      )
      .slice(0, 6)

    const matchNotes = (notes || [])
      .filter((n) => n.content?.toLowerCase().includes(q))
      .slice(0, 4)

    const matchHistory = history
      .filter((h) =>
        h.action?.toLowerCase().includes(q) ||
        h.details?.toLowerCase().includes(q)
      )
      .slice(0, 4)

    return { tasks: matchTasks, notes: matchNotes, history: matchHistory }
  }, [query, tasks, notes, history])

  const total = results.tasks.length + results.notes.length + results.history.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            className="flex-1 text-gray-900 dark:text-white bg-transparent text-base focus:outline-none placeholder-gray-400"
            placeholder="Buscar tareas, notas, historial..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query && (
            <div className="text-center py-12 text-gray-400">
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Escribe para buscar en todo el panel</p>
              <p className="text-xs mt-1 text-gray-300">Tareas · Notas · Historial</p>
            </div>
          )}

          {query && total === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">Sin resultados para "<strong>{query}</strong>"</p>
            </div>
          )}

          {/* Tasks */}
          {results.tasks.length > 0 && (
            <div>
              <div className="px-4 py-2 flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50">
                <ListTodo size={13} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Tareas ({results.tasks.length})
                </span>
              </div>
              {results.tasks.map((task) => {
                const member = TEAM_MEMBERS.find((m) => m.id === task.assignee_id)
                return (
                  <button
                    key={task.id}
                    onClick={() => { onNavigate('tasks', task); onClose() }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left border-b border-gray-50 dark:border-gray-700"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: member?.color }}
                    >
                      {member?.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{task.title}</p>
                      <p className="text-xs text-gray-400">{task.category} · {member?.name.split(' ')[0]}</p>
                    </div>
                    <StatusBadge status={task.status} />
                  </button>
                )
              })}
            </div>
          )}

          {/* Notes */}
          {results.notes.length > 0 && (
            <div>
              <div className="px-4 py-2 flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50">
                <StickyNote size={13} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Notas ({results.notes.length})
                </span>
              </div>
              {results.notes.map((note) => {
                const member = TEAM_MEMBERS.find((m) => m.id === note.author_id)
                return (
                  <button
                    key={note.id}
                    onClick={() => { onNavigate('notes'); onClose() }}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left border-b border-gray-50 dark:border-gray-700"
                  >
                    <span className="text-lg shrink-0">📝</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{note.content}</p>
                      <p className="text-xs text-gray-400">{member?.name.split(' ')[0]} · {format(new Date(note.created_at), "d MMM", { locale: es })}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* History */}
          {results.history.length > 0 && (
            <div>
              <div className="px-4 py-2 flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50">
                <Clock size={13} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Historial ({results.history.length})
                </span>
              </div>
              {results.history.map((entry) => {
                const member = TEAM_MEMBERS.find((m) => m.id === entry.author_id)
                return (
                  <button
                    key={entry.id}
                    onClick={() => { onNavigate('history'); onClose() }}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left border-b border-gray-50 dark:border-gray-700"
                  >
                    <span className="text-sm shrink-0">🕐</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        <span className="font-medium">{member?.name.split(' ')[0]}</span> {entry.action}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{entry.details}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {format(new Date(entry.created_at), "d MMM", { locale: es })}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Footer */}
          {total > 0 && (
            <div className="px-4 py-2 text-center">
              <p className="text-xs text-gray-400">{total} resultado{total !== 1 ? 's' : ''} · Enter para abrir · Esc para cerrar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
