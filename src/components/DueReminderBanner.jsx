import { useState, useMemo, useEffect } from 'react'
import { AlertTriangle, Clock, X, Bell, ExternalLink, ArrowRight } from 'lucide-react'
import { parseISO, isPast, isToday, differenceInDays } from 'date-fns'
import { TEAM_MEMBERS } from '../data/initialData'

export function DueReminderBanner({ tasks, currentUser, onNavigate }) {
  const [dismissed, setDismissed] = useState(false)
  const [notifGranted, setNotifGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission === 'granted' : false
  )

  const user = useMemo(() => TEAM_MEMBERS.find((m) => m.id === currentUser), [currentUser])

  // Reset dismissal when user changes
  useEffect(() => {
    setDismissed(false)
  }, [currentUser])

  const reminderData = useMemo(() => {
    const userTasks = tasks.filter((t) => t.assignee_id === currentUser && t.status !== 'DONE')
    
    const overdue = []
    const dueToday = []
    const dueThisWeek = []

    userTasks.forEach((t) => {
      if (!t.due_date) return
      const date = parseISO(t.due_date)
      if (isPast(date) && !isToday(date)) {
        overdue.push(t)
      } else if (isToday(date)) {
        dueToday.push(t)
      } else {
        const diff = differenceInDays(date, new Date())
        if (diff <= 7) {
          dueThisWeek.push(t)
        }
      }
    })

    const totalUrgent = overdue.length + dueToday.length + dueThisWeek.length
    return { overdue, dueToday, dueThisWeek, totalUrgent }
  }, [tasks, currentUser])

  const handleRequestNotif = async () => {
    if (!('Notification' in window)) return
    const perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setNotifGranted(true)
      if (reminderData.totalUrgent > 0) {
        new Notification('Panel Arma-dilo: Tareas próximas', {
          body: `Hola ${user?.name.split(' ')[0] || ''}, tienes ${reminderData.totalUrgent} tarea(s) pendientes con fecha próxima.`,
          icon: '/favicon.ico',
        })
      }
    }
  }

  if (dismissed || reminderData.totalUrgent === 0) return null

  const hasOverdue = reminderData.overdue.length > 0
  const firstName = user?.name.split(' ')[0] || 'Hola'

  return (
    <aside aria-label="Alerta de tareas urgentes" className={`border-b transition-colors px-4 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm ${
      hasOverdue
        ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200'
        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
    }`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`p-1 rounded-lg shrink-0 ${
          hasOverdue ? 'bg-red-200/70 dark:bg-red-900/80 text-red-700 dark:text-red-300' : 'bg-amber-200/70 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300'
        }`}>
          {hasOverdue ? <AlertTriangle size={15} /> : <Clock size={15} />}
        </span>

        <p className="truncate">
          <span className="font-semibold">{firstName}:</span>{' '}
          {hasOverdue ? (
            <>
              Tienes <strong className="font-bold underline">{reminderData.overdue.length} tarea{reminderData.overdue.length > 1 ? 's' : ''} vencida{reminderData.overdue.length > 1 ? 's' : ''}</strong>
              {reminderData.dueToday.length > 0 && ` y ${reminderData.dueToday.length} para hoy`}
              {reminderData.dueThisWeek.length > 0 && `, más ${reminderData.dueThisWeek.length} esta semana`}.
            </>
          ) : (
            <>
              Tienes <strong>{reminderData.totalUrgent} tarea{reminderData.totalUrgent > 1 ? 's' : ''}</strong> por entregar en los próximos 7 días
              {reminderData.dueToday.length > 0 && ` (${reminderData.dueToday.length} para hoy)`}.
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onNavigate('tasks')}
          className={`flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg transition-colors text-xs ${
            hasOverdue
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          <span>Ver mis tareas</span>
          <ArrowRight size={12} />
        </button>

        {'Notification' in window && !notifGranted && (
          <button
            onClick={handleRequestNotif}
            title="Activar notificaciones del navegador"
            className="hidden sm:flex items-center gap-1 text-xs opacity-75 hover:opacity-100 px-2 py-1 rounded border border-current transition-opacity"
          >
            <Bell size={12} />
            <span>Notificarme</span>
          </button>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
          title="Ocultar recordatorio"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  )
}
