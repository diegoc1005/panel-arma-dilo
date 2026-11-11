export function StatusBadge({ status }) {
  const styles = {
    TODO:        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    REVIEW:      'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    BLOCKED:     'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    DONE:        'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  }
  const labels = {
    TODO:        'Por hacer',
    IN_PROGRESS: 'En progreso',
    REVIEW:      'En revisión',
    BLOCKED:     '🚫 Bloqueada',
    DONE:        'Hecho',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.TODO}`}>
      {labels[status] || status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const styles = {
    LOW:    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    MEDIUM: 'bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
    HIGH:   'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400',
  }
  const labels = {
    LOW:    '↓ Baja',
    MEDIUM: '→ Media',
    HIGH:   '↑ Alta',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[priority] || styles.MEDIUM}`}>
      {labels[priority] || priority}
    </span>
  )
}

export function CategoryBadge({ category }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
      {category}
    </span>
  )
}
