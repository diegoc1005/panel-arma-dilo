import { useMemo } from 'react'
import { TEAM_MEMBERS } from '../data/initialData'
import { parseISO, format, differenceInDays, addDays, eachWeekOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'

const PROJECT_START = new Date('2026-11-09')
const PROJECT_END   = new Date('2026-12-05')
const TOTAL_DAYS    = differenceInDays(PROJECT_END, PROJECT_START) + 1
const ROW_HEIGHT    = 32   // px por fila de tarea
const LABEL_WIDTH   = 220  // px columna izquierda

const STATUS_STYLE = {
  DONE:        { bg: '#22c55e', label: 'Hecho' },
  IN_PROGRESS: { bg: '#3b82f6', label: 'En progreso' },
  REVIEW:      { bg: '#f59e0b', label: 'En revisión' },
  TODO:        { bg: '#a5b4fc', label: 'Por hacer' },
}

// Convierte una fecha a porcentaje del eje X
function toPct(date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  const clamped = new Date(Math.max(d.getTime(), PROJECT_START.getTime()))
  return (differenceInDays(clamped, PROJECT_START) / TOTAL_DAYS) * 100
}

// Genera las marcas del encabezado (cada 7 días)
function getHeaderMarks() {
  const marks = []
  let d = new Date(PROJECT_START)
  while (d <= PROJECT_END) {
    marks.push(new Date(d))
    d = addDays(d, 7)
  }
  // asegurar que el último día aparezca
  if (differenceInDays(PROJECT_END, marks[marks.length - 1]) > 2) {
    marks.push(new Date(PROJECT_END))
  }
  return marks
}

export function Timeline({ tasks }) {
  const headerMarks = useMemo(() => getHeaderMarks(), [])
  const todayPct    = toPct(new Date())

  const byMember = useMemo(() => {
    return TEAM_MEMBERS.map((member) => {
      const memberTasks = tasks
        .filter((t) => t.assignee_id === member.id && t.due_date)
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      return { ...member, tasks: memberTasks }
    })
  }, [tasks])

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline del proyecto</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {format(PROJECT_START, "d 'de' MMM", { locale: es })} →{' '}
          {format(PROJECT_END,   "d 'de' MMM yyyy", { locale: es })}
          {' · '}{TOTAL_DAYS} días
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(STATUS_STYLE).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: v.bg }} />
            <span className="text-xs text-gray-600 dark:text-gray-300">{v.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-px h-4 bg-red-500" />
          <span className="text-xs text-gray-600 dark:text-gray-300">Hoy</span>
        </div>
      </div>

      {/* Gantt container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-x-auto">
        <div style={{ minWidth: LABEL_WIDTH + 600 }}>

          {/* ── Header de fechas ── */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-20">
            {/* Columna de etiqueta */}
            <div
              className="shrink-0 flex items-center px-4 py-2 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              style={{ width: LABEL_WIDTH }}
            >
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Integrante / Tarea
              </span>
            </div>

            {/* Eje de fechas */}
            <div className="flex-1 relative h-9 bg-gray-50 dark:bg-gray-800 overflow-hidden">
              {headerMarks.map((d, i) => {
                const pct = toPct(d)
                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 flex flex-col justify-center pl-1 border-l border-gray-200 dark:border-gray-700"
                    style={{ left: `${pct}%` }}
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {format(d, 'd MMM', { locale: es })}
                    </span>
                  </div>
                )
              })}
              {/* Hoy en el header */}
              {todayPct >= 0 && todayPct <= 100 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-400"
                  style={{ left: `${todayPct}%` }}
                />
              )}
            </div>
          </div>

          {/* ── Filas por integrante ── */}
          {byMember.map((member) => (
            <div key={member.id}>

              {/* Cabecera del miembro */}
              <div className="flex border-b border-gray-100 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-750 dark:bg-gray-700/40">
                <div
                  className="shrink-0 flex items-center gap-2 px-4 py-2 border-r border-gray-200 dark:border-gray-700"
                  style={{ width: LABEL_WIDTH }}
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                      {member.name.split(' ').slice(0, 2).join(' ')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{member.role}</p>
                  </div>
                </div>

                {/* Área de la barra del miembro (vacía, solo grid) */}
                <div className="flex-1 relative py-2" style={{ height: ROW_HEIGHT }}>
                  <GridLines marks={headerMarks} todayPct={todayPct} />
                </div>
              </div>

              {/* Filas de tareas del miembro */}
              {member.tasks.length === 0 ? (
                <div className="flex border-b border-gray-50 dark:border-gray-700/50">
                  <div
                    className="shrink-0 flex items-center px-4 border-r border-gray-100 dark:border-gray-700/50"
                    style={{ width: LABEL_WIDTH, height: ROW_HEIGHT }}
                  >
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">Sin tareas con fecha</span>
                  </div>
                  <div className="flex-1" style={{ height: ROW_HEIGHT }} />
                </div>
              ) : (
                member.tasks.map((task) => {
                  const style = STATUS_STYLE[task.status] || STATUS_STYLE.TODO
                  // La barra va desde 7 días antes del vencimiento hasta el vencimiento
                  const dueDate = parseISO(task.due_date)
                  const startDate = new Date(Math.max(
                    addDays(dueDate, -7).getTime(),
                    PROJECT_START.getTime()
                  ))
                  const endDate = new Date(Math.min(dueDate.getTime(), PROJECT_END.getTime()))

                  const barLeft  = toPct(startDate)
                  const barRight = toPct(endDate) + (1 / TOTAL_DAYS * 100) // incluir el día del vencimiento
                  const barWidth = Math.max(barRight - barLeft, 0.8)

                  return (
                    <div
                      key={task.id}
                      className="flex border-b border-gray-50 dark:border-gray-700/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 group transition-colors"
                    >
                      {/* Label */}
                      <div
                        className="shrink-0 flex items-center px-4 border-r border-gray-100 dark:border-gray-700/50"
                        style={{ width: LABEL_WIDTH, height: ROW_HEIGHT }}
                      >
                        <span
                          className="text-xs text-gray-600 dark:text-gray-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors truncate"
                          title={task.title}
                        >
                          {task.status === 'DONE' && <span className="mr-1 text-green-500">✓</span>}
                          {task.title}
                        </span>
                      </div>

                      {/* Barra */}
                      <div className="flex-1 relative" style={{ height: ROW_HEIGHT }}>
                        <GridLines marks={headerMarks} todayPct={todayPct} />

                        {/* La barra en sí */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 rounded-md z-10 transition-opacity hover:opacity-100"
                          style={{
                            left:            `${barLeft}%`,
                            width:           `${barWidth}%`,
                            height:          18,
                            backgroundColor: style.bg,
                            opacity:         task.status === 'DONE' ? 1 : 0.75,
                          }}
                          title={`${task.title} — vence ${format(dueDate, "d 'de' MMM", { locale: es })}`}
                        >
                          {/* Fecha dentro de la barra si hay espacio */}
                          {barWidth > 8 && (
                            <span className="absolute inset-0 flex items-center px-1.5 text-white text-xs font-medium overflow-hidden whitespace-nowrap">
                              {format(dueDate, 'd MMM', { locale: es })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          ))}

          {/* Footer: línea de hoy con label */}
          <div className="flex">
            <div className="shrink-0 border-r border-gray-200 bg-gray-50 py-1.5 px-4" style={{ width: LABEL_WIDTH }}>
              <span className="text-xs text-red-500 font-medium">
                Hoy: {format(new Date(), "d 'de' MMM", { locale: es })}
              </span>
            </div>
            <div className="flex-1 relative h-6 bg-gray-50">
              {todayPct >= 0 && todayPct <= 100 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-400"
                  style={{ left: `${todayPct}%` }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente auxiliar para las líneas de grid verticales
function GridLines({ marks, todayPct }) {
  return (
    <>
      {marks.map((d, i) => {
        const pct = toPct(d)
        return (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-gray-100 pointer-events-none"
            style={{ left: `${pct}%` }}
          />
        )
      })}
      {todayPct >= 0 && todayPct <= 100 && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-300 pointer-events-none z-10"
          style={{ left: `${todayPct}%` }}
        />
      )}
    </>
  )
}
