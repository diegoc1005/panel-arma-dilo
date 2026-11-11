import { useMemo } from 'react'
import {
  CheckCircle2, Clock, AlertTriangle, ListTodo,
  TrendingUp, Users, Flame, Tag, Zap, AlertOctagon
} from 'lucide-react'
import { TEAM_MEMBERS } from '../data/initialData'
import { Avatar } from '../components/Avatar'
import { format, parseISO, isPast, isToday, differenceInDays, isTomorrow, isYesterday, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

// Fecha límite del proyecto
const DEADLINE = new Date('2026-12-05')

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function DaysChip({ dueDate, status }) {
  if (!dueDate || status === 'DONE') return null
  const date = parseISO(dueDate)
  const days = differenceInDays(date, new Date())

  if (isPast(date) && !isToday(date)) {
    return <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Vencida</span>
  }
  if (isToday(date)) {
    return <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">¡Hoy!</span>
  }
  if (isTomorrow(date)) {
    return <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Mañana</span>
  }
  if (days <= 3) {
    return <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">{days}d</span>
  }
  if (days <= 7) {
    return <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{days}d</span>
  }
  return <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{days}d</span>
}

export function Dashboard({ tasks, history }) {
  const daysToDeadline = differenceInDays(DEADLINE, new Date())

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t) => t.status === 'DONE').length
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length
    const overdue = tasks.filter(
      (t) => t.due_date && t.status !== 'DONE' && isPast(parseISO(t.due_date)) && !isToday(parseISO(t.due_date))
    ).length
    const progress = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, inProgress, overdue, progress }
  }, [tasks])

  // Tareas que necesitan atención: vencidas + vencen en ≤48h
  const urgentTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status === 'DONE' || !t.due_date) return false
        const date = parseISO(t.due_date)
        const days = differenceInDays(date, new Date())
        return isPast(date) || days <= 2
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 8)
  }, [tasks])

  // Avance por categoría
  const categoryStats = useMemo(() => {
    const cats = {}
    tasks.forEach((t) => {
      if (!cats[t.category]) cats[t.category] = { total: 0, done: 0 }
      cats[t.category].total++
      if (t.status === 'DONE') cats[t.category].done++
    })
    return Object.entries(cats)
      .map(([name, s]) => ({ name, ...s, pct: Math.round((s.done / s.total) * 100) }))
      .sort((a, b) => a.pct - b.pct) // menos avanzadas primero
  }, [tasks])

  const memberStats = useMemo(() => {
    return TEAM_MEMBERS.map((member) => {
      const memberTasks = tasks.filter((t) => t.assignee_id === member.id)
      const done = memberTasks.filter((t) => t.status === 'DONE').length
      const total = memberTasks.length
      const pct = total > 0 ? Math.round((done / total) * 100) : 0
      return { ...member, total, done, pct }
    })
  }, [tasks])

  // Daily standup: completado ayer, en progreso hoy, bloqueadas
  const standup = useMemo(() => {
    const yesterday = subDays(new Date(), 1)
    const completedYesterday = history
      .filter((h) => h.action === 'Tarea actualizada' && h.details?.includes('"DONE"') &&
        isYesterday(new Date(h.created_at)))
      .map((h) => tasks.find((t) => t.id === h.task_id))
      .filter(Boolean)
      .slice(0, 5)

    const inProgressNow = tasks.filter((t) => t.status === 'IN_PROGRESS').slice(0, 6)
    const blocked = tasks.filter((t) => t.status === 'BLOCKED')
    return { completedYesterday, inProgressNow, blocked }
  }, [tasks, history])

  // Carga de trabajo: tareas activas + en zona de peligro (<5 días)
  const workload = useMemo(() => {
    return TEAM_MEMBERS.map((member) => {
      const active = tasks.filter((t) =>
        t.assignee_id === member.id && t.status !== 'DONE'
      )
      const danger = active.filter((t) => {
        if (!t.due_date) return false
        const days = differenceInDays(parseISO(t.due_date), new Date())
        return days <= 5 && days >= 0
      })
      const blocked = active.filter((t) => t.status === 'BLOCKED')
      const level = blocked.length > 0 ? 'blocked' :
                    danger.length >= 2 ? 'high' :
                    danger.length === 1 ? 'medium' : 'ok'
      return { ...member, active: active.length, danger: danger.length, blocked: blocked.length, level }
    })
  }, [tasks])

  const categoryColors = [
    '#6366f1','#0ea5e9','#10b981','#f59e0b','#ec4899',
    '#8b5cf6','#14b8a6','#f97316','#ef4444','#84cc16',
  ]

  const recentHistory = history.slice(0, 8)

  const workloadColor = { ok: '#22c55e', medium: '#f59e0b', high: '#ef4444', blocked: '#7c3aed' }
  const workloadLabel = { ok: 'Al día', medium: 'Atención', high: 'Sobrecargado', blocked: 'Bloqueado' }

  return (
    <div className="space-y-6">
      {/* Header con countdown al deadline */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sistema de Gestión de Pago de Honorarios — Equipo Arma-dilo</p>
        </div>
        <div className={`text-center px-5 py-3 rounded-2xl border-2 ${
          daysToDeadline <= 7 ? 'border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40' :
          daysToDeadline <= 14 ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40' :
          'border-indigo-100 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40'
        }`}>
          <p className={`text-3xl font-black ${
            daysToDeadline <= 7 ? 'text-red-600 dark:text-red-400' :
            daysToDeadline <= 14 ? 'text-amber-600 dark:text-amber-400' : 'text-indigo-600 dark:text-indigo-400'
          }`}>{daysToDeadline}</p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">días al deadline</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">5 Dic 2026</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ListTodo} label="Total de tareas" value={stats.total} color="bg-indigo-500" />
        <StatCard icon={CheckCircle2} label="Completadas" value={stats.done} color="bg-green-500" sub={`${stats.progress}% del total`} />
        <StatCard icon={Clock} label="En progreso" value={stats.inProgress} color="bg-blue-500" />
        <StatCard icon={AlertTriangle} label="Vencidas" value={stats.overdue} color="bg-red-500" sub={stats.overdue > 0 ? '¡Atención!' : 'Al día ✓'} />
      </div>

      {/* ⚠️ Alerta de tareas urgentes */}
      {urgentTasks.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={18} className="text-red-500" />
            <h2 className="font-bold text-red-700 dark:text-red-400">Atención requerida — {urgentTasks.length} tarea{urgentTasks.length > 1 ? 's' : ''} urgente{urgentTasks.length > 1 ? 's' : ''}</h2>
          </div>
          <div className="space-y-2">
            {urgentTasks.map((task) => {
              const member = TEAM_MEMBERS.find((m) => m.id === task.assignee_id)
              return (
                <div key={task.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-2.5 border border-red-100 dark:border-red-900/40">
                  <Avatar memberId={task.assignee_id} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{task.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{member?.name.split(' ')[0]} · {member?.role}</p>
                  </div>
                  <DaysChip dueDate={task.due_date} status={task.status} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Progress bar general */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" />
            <h2 className="font-semibold text-gray-800 dark:text-white">Avance general del proyecto</h2>
          </div>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.progress}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-4 rounded-full transition-all duration-700"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-2">
          <span>{stats.done} tareas completadas</span>
          <span>{stats.total - stats.done} restantes</span>
        </div>
      </div>

      {/* Avance por categoría */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Tag size={18} className="text-indigo-500" />
          <h2 className="font-semibold text-gray-800 dark:text-white">Avance por entregable</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categoryStats.map((cat, i) => (
            <div key={cat.name} className="flex items-center gap-3">
              <div className="w-28 shrink-0">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{cat.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{cat.done}/{cat.total}</p>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${cat.pct}%`,
                      backgroundColor: categoryColors[i % categoryColors.length]
                    }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-8 text-right">{cat.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progreso por integrante */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Users size={18} className="text-indigo-500" />
          <h2 className="font-semibold text-gray-800 dark:text-white">Progreso por integrante</h2>
        </div>
        <div className="space-y-4">
          {memberStats.map((m) => (
            <div key={m.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Avatar memberId={m.id} size="sm" />
                  <div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.name.split(' ').slice(0, 2).join(' ')}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{m.role}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{m.done}/{m.total}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carga de trabajo por integrante */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Zap size={18} className="text-indigo-500" />
          <h2 className="font-semibold text-gray-800 dark:text-white">Carga de trabajo actual</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {workload.map((m) => (
            <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
              m.level === 'blocked' ? 'border-purple-200 bg-purple-50 dark:bg-purple-900/20' :
              m.level === 'high'    ? 'border-red-200 bg-red-50 dark:bg-red-900/20' :
              m.level === 'medium'  ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/20' :
              'border-green-100 bg-green-50/50 dark:bg-green-900/10'
            }`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: m.color }}>
                {m.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                  {m.name.split(' ').slice(0, 2).join(' ')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {m.active} activa{m.active !== 1 ? 's' : ''}
                  {m.danger > 0 && <span className="text-amber-600 ml-1">· {m.danger} urgente{m.danger !== 1 ? 's' : ''}</span>}
                  {m.blocked > 0 && <span className="text-purple-600 ml-1">· {m.blocked} bloqueada{m.blocked !== 1 ? 's' : ''}</span>}
                </p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: workloadColor[m.level] + '22', color: workloadColor[m.level] }}>
                {workloadLabel[m.level]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Standup */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <AlertOctagon size={18} className="text-indigo-500" />
          <h2 className="font-semibold text-gray-800 dark:text-white">Vista Daily Standup</h2>
          <span className="text-xs text-gray-400 ml-1">— resumen rápido del estado del equipo</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Completado ayer */}
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">✅ Completado ayer</p>
            {standup.completedYesterday.length === 0
              ? <p className="text-xs text-gray-400 italic">Sin completados ayer</p>
              : standup.completedYesterday.map((t) => (
                <div key={t.id} className="flex items-center gap-2 mb-1.5">
                  <Avatar memberId={t.assignee_id} size="sm" />
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{t.title}</p>
                </div>
              ))
            }
          </div>
          {/* En progreso */}
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">🔄 En progreso hoy</p>
            {standup.inProgressNow.length === 0
              ? <p className="text-xs text-gray-400 italic">Nada en progreso</p>
              : standup.inProgressNow.map((t) => (
                <div key={t.id} className="flex items-center gap-2 mb-1.5">
                  <Avatar memberId={t.assignee_id} size="sm" />
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{t.title}</p>
                </div>
              ))
            }
          </div>
          {/* Bloqueadas */}
          <div>
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">🚫 Bloqueadas</p>
            {standup.blocked.length === 0
              ? <p className="text-xs text-gray-400 italic">Sin bloqueos ✓</p>
              : standup.blocked.map((t) => (
                <div key={t.id} className="flex items-center gap-2 mb-1.5">
                  <Avatar memberId={t.assignee_id} size="sm" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{t.title}</p>
                    {t.blocked_reason && <p className="text-xs text-red-500 truncate">{t.blocked_reason}</p>}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-4">Actividad reciente</h2>
        {recentHistory.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Sin actividad registrada aún.</p>
        ) : (
          <div className="space-y-3">
            {recentHistory.map((entry) => {
              const author = TEAM_MEMBERS.find((m) => m.id === entry.author_id)
              return (
                <div key={entry.id} className="flex items-start gap-3">
                  <Avatar memberId={entry.author_id} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{author?.name.split(' ')[0]}</span>
                      {' '}<span className="text-gray-500">{entry.action}</span>
                      {' '}<span className="text-gray-600 text-xs">{entry.details}</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(entry.created_at), "d 'de' MMM 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
