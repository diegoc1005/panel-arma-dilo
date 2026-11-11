import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { TEAM_MEMBERS } from '../data/initialData'
import { Avatar } from '../components/Avatar'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ACTION_ICONS = {
  'Tarea creada': '✅',
  'Tarea actualizada': '✏️',
  'Tarea eliminada': '🗑️',
  'Comentario añadido': '💬',
}

export function History({ history, tasks }) {
  const grouped = useMemo(() => {
    const groups = {}
    history.forEach((entry) => {
      const date = format(new Date(entry.created_at), "EEEE d 'de' MMMM", { locale: es })
      if (!groups[date]) groups[date] = []
      groups[date].push(entry)
    })
    return groups
  }, [history])

  const getTaskTitle = (taskId) => {
    const task = tasks.find((t) => t.id === taskId)
    return task?.title || `Tarea #${taskId}`
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historial de cambios</h1>
        <p className="text-gray-500 text-sm mt-1">{history.length} eventos registrados</p>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Clock size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">Sin actividad registrada aún. Los cambios aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 capitalize">
                {date}
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-sm">
                {entries.map((entry) => {
                  const author = TEAM_MEMBERS.find((m) => m.id === entry.author_id)
                  const icon = ACTION_ICONS[entry.action] || '📌'
                  return (
                    <div key={entry.id} className="flex items-start gap-4 p-4">
                      <span className="text-xl mt-0.5">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Avatar memberId={entry.author_id} size="sm" />
                          <span className="text-sm font-semibold text-gray-800">{author?.name.split(' ')[0]}</span>
                          <span className="text-sm text-gray-500">{entry.action}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          <span className="font-medium text-gray-700">{getTaskTitle(entry.task_id)}</span>
                          {entry.details && ` — ${entry.details}`}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {format(new Date(entry.created_at), 'HH:mm')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
