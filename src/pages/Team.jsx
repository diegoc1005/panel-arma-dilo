import { useMemo } from 'react'
import { TEAM_MEMBERS } from '../data/initialData'
import { CheckCircle2, Clock, Wifi } from 'lucide-react'
import { getPresence } from '../hooks/usePresence'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function Team({ tasks }) {
  const presence = getPresence()

  const memberData = useMemo(() => {
    return TEAM_MEMBERS.map((member) => {
      const memberTasks = tasks.filter((t) => t.assignee_id === member.id)
      const done = memberTasks.filter((t) => t.status === 'DONE')
      const inProgress = memberTasks.filter((t) => t.status === 'IN_PROGRESS')
      const review = memberTasks.filter((t) => t.status === 'REVIEW')
      const blocked = memberTasks.filter((t) => t.status === 'BLOCKED')
      const pct = memberTasks.length > 0 ? Math.round((done.length / memberTasks.length) * 100) : 0

      const lastSeen = presence[member.id]
      let lastSeenLabel = 'Sin actividad'
      let lastSeenColor = 'text-gray-400'
      if (lastSeen) {
        const mins = (Date.now() - new Date(lastSeen).getTime()) / 60000
        if (mins < 5) {
          lastSeenLabel = 'En línea ahora'
          lastSeenColor = 'text-green-500'
        } else if (mins < 60) {
          lastSeenLabel = `Hace ${Math.round(mins)} min`
          lastSeenColor = 'text-blue-500'
        } else {
          lastSeenLabel = `Visto ${formatDistanceToNow(new Date(lastSeen), { locale: es, addSuffix: true })}`
          lastSeenColor = mins > 60 * 48 ? 'text-red-400' : 'text-gray-400'
        }
      }

      return { ...member, memberTasks, done, inProgress, review, blocked, pct, lastSeenLabel, lastSeenColor }
    })
  }, [tasks, presence])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Equipo Arma-dilo</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Sistema de Gestión de Pago de Honorarios — Equipo 6 · 5to semestre Grupo 6
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {memberData.map((member) => (
          <div key={member.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                style={{ backgroundColor: member.color }}>
                {member.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white">{member.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                {/* Última vez activo */}
                <div className={`flex items-center gap-1 mt-1 ${member.lastSeenColor}`}>
                  <Wifi size={11} />
                  <span className="text-xs">{member.lastSeenLabel}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 dark:text-gray-400">Progreso</span>
                <span className="font-bold text-gray-800 dark:text-white">{member.pct}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                <div className="h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${member.pct}%`, backgroundColor: member.color }} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-center mb-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl py-2">
                <p className="text-xl font-bold text-gray-900 dark:text-white">{member.memberTasks.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl py-2">
                <p className="text-xl font-bold text-green-600">{member.done.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completadas</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl py-2">
                <p className="text-xl font-bold text-blue-600">{member.inProgress.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">En progreso</p>
              </div>
              <div className={`rounded-xl py-2 ${member.blocked.length > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                <p className={`text-xl font-bold ${member.blocked.length > 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {member.blocked.length > 0 ? member.blocked.length : member.review.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {member.blocked.length > 0 ? 'Bloqueadas' : 'En revisión'}
                </p>
              </div>
            </div>

            {/* Recent tasks */}
            {member.memberTasks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Tareas recientes</p>
                <div className="space-y-1.5">
                  {member.memberTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      {task.status === 'DONE'
                        ? <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                        : task.status === 'BLOCKED'
                        ? <span className="text-xs shrink-0">🚫</span>
                        : <Clock size={13} className="text-gray-400 shrink-0" />
                      }
                      <p className={`text-xs truncate ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {task.title}
                      </p>
                    </div>
                  ))}
                  {member.memberTasks.length > 3 && (
                    <p className="text-xs text-gray-400">+{member.memberTasks.length - 3} más...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
